const express = require("express");
const router = express.Router();
const { verifyCoupon, getCoupons, createCoupon, deleteCoupon } = require("../controllers/couponController");
const { protect, admin } = require("../middleware/auth");

router.post("/verify", protect, verifyCoupon);
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
