const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Price at the time of order
  variant: {
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    sku: { type: String },
    barcode: { type: String }
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [OrderItemSchema],
  customerInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }, // Province / State
    zip: { type: String, required: true },
    country: { type: String, required: true }
  },
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String }
  },
  sameAsShipping: { type: Boolean, default: true },
  orderNotes: { type: String },
  payment: {
    id: { type: String }, // Transaction ID
    method: { type: String, enum: ["Stripe", "PayPal", "JazzCash", "EasyPaisa", "COD", "Bank Transfer"], required: true },
    status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" }
  },
  coupon: {
    code: { type: String },
    discountAmount: { type: Number, default: 0 }
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"],
    default: "Pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", OrderSchema);
