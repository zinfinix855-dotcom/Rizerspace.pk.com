const express = require("express");
const router = express.Router();

// In-memory orders store (replace with DB in production)
const orders = [];

// POST /api/orders — place a new order
router.post("/", (req, res, next) => {
  try {
    const { name, email, address, items } = req.body;

    // Basic validation
    if (!name || !email || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields: name, email, address, items" });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = {
      id:        `ORD-${Date.now()}`,
      name,
      email,
      address,
      items,
      total:     parseFloat(total.toFixed(2)),
      status:    "confirmed",
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    console.log(`📦 New order placed: ${order.id} — $${order.total} — ${email}`);

    // In production you would:
    //   1. Save to database
    //   2. Send confirmation email (Resend / Nodemailer)
    //   3. Trigger payment via Stripe

    res.status(201).json({
      message: "Order confirmed",
      data:    order,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — list all orders (admin use — protect with auth in production)
router.get("/", (req, res) => {
  res.json({ data: orders, total: orders.length });
});

module.exports = router;
