const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { placeOrder, getUserOrders, getOrderById, cancelOrder, adminGetOrders, adminUpdateOrderStatus } = require("../controllers/orderController");
const { placeOrderSchema } = require("../validation/schemas");
const { protect, admin } = require("../middleware/auth");

// Customer routes
router.post("/", protect, validate(placeOrderSchema), placeOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/", protect, admin, adminGetOrders);
router.put("/:id/status", protect, admin, adminUpdateOrderStatus);

module.exports = router;
