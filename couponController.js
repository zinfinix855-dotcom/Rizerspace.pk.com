const Coupon = require("../models/Coupon");

// @desc    Verify coupon code validity
// @route   POST /api/coupons/verify
// @access  Private
const verifyCoupon = async (req, res, next) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ error: "Invalid or inactive coupon code" });
    }

    if (coupon.expiryDate < Date.now()) {
      return res.status(400).json({ error: "Coupon code has expired" });
    }

    res.json({
      message: "Coupon applied successfully!",
      data: {
        code: coupon.code,
        discount: coupon.discount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  const { code, discount, expiryDate } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount: Number(discount),
      expiryDate: new Date(expiryDate)
    });

    res.status(201).json({ data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    await coupon.deleteOne();
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
};
