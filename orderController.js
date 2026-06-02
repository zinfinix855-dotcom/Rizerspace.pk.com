const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res, next) => {
  const {
    products,
    customerInfo,
    shippingAddress,
    billingAddress,
    sameAsShipping,
    orderNotes,
    paymentMethod,
    paymentId,
    couponCode
  } = req.body;

  try {
    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products in order" });
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.phone) {
      return res.status(400).json({ error: "Customer profile details (name, phone) are required" });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip || !shippingAddress.country) {
      return res.status(400).json({ error: "Complete shipping address details are required" });
    }

    if (!sameAsShipping && (!billingAddress || !billingAddress.street || !billingAddress.city || !billingAddress.zip || !billingAddress.country)) {
      return res.status(400).json({ error: "Complete billing address details are required when billing differs from shipping" });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.product} not found` });
      }

      let itemPrice = product.discountedPrice || product.price;
      let variantMeta = undefined;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(400).json({ error: `Variant not found for product: ${product.title}` });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for variant ${variant.name}` });
        }
        itemPrice = variant.price;
        availableStock = variant.stock;
        variantMeta = {
          id: variant._id,
          name: variant.name,
          sku: variant.sku,
          barcode: variant.barcode
        };
      } else if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.title}` });
      }

      calculatedTotal += itemPrice * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
        variant: variantMeta
      });
    }

    let discountAmount = 0;
    let couponRef = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > Date.now()) {
        discountAmount = (calculatedTotal * coupon.discount) / 100;
        couponRef = {
          code: coupon.code,
          discountAmount
        };
      }
    }

    const finalAmount = Math.max(0, calculatedTotal - discountAmount);
    const resolvedBillingAddress = sameAsShipping ? shippingAddress : billingAddress;

    const instantPaidMethods = ["Stripe", "PayPal"];
    const processingMethods = ["JazzCash", "EasyPaisa", "Bank Transfer"];

    const paymentStatus = instantPaidMethods.includes(paymentMethod) ? "Paid" : "Pending";
    let orderStatus = "Pending";

    if (paymentMethod === "COD") {
      orderStatus = "Confirmed";
    } else if (processingMethods.includes(paymentMethod)) {
      orderStatus = "Processing";
    } else if (instantPaidMethods.includes(paymentMethod)) {
      orderStatus = "Processing";
    }

    const order = await Order.create({
      customer: req.user._id,
      products: orderItems,
      customerInfo,
      shippingAddress,
      billingAddress: resolvedBillingAddress,
      sameAsShipping: !!sameAsShipping,
      orderNotes: orderNotes || "",
      payment: {
        id: paymentId || (paymentMethod === "COD" ? `COD-TXN-${Date.now()}` : `PAYMENT-${Date.now()}`),
        method: paymentMethod,
        status: paymentStatus
      },
      coupon: couponRef,
      totalAmount: Math.round(finalAmount * 100) / 100,
      status: orderStatus
    });

    for (const item of orderItems) {
      if (item.variant && item.variant.id) {
        await Product.updateOne(
          { _id: item.product, "variants._id": item.variant.id },
          {
            $inc: {
              "variants.$.stock": -item.quantity,
              stock: -item.quantity
            }
          }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("products.product", "title images category")
      .sort({ createdAt: -1 });

    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("products.product", "title images category");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify user owns the order or is an admin
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to view this order" });
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer or Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Auth validation
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to cancel this order" });
    }

    if (order.status !== "Pending" && order.status !== "Processing") {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }

    order.status = "Cancelled";
    await order.save();

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    res.json({ message: "Order cancelled successfully", data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("customer", "name email")
      .populate("products.product", "title category price")
      .sort({ createdAt: -1 });

    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const adminUpdateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"];

  try {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    if (status === "Delivered" && order.payment.status === "Pending") {
      order.payment.status = "Paid";
    }

    await order.save();
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  adminGetOrders,
  adminUpdateOrderStatus
};
