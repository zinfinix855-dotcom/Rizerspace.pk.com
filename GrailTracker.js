const mongoose = require("mongoose");

const GrailTrackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  targetPrice: { type: Number, default: null }, // null = no price alert
  notifyOnRestock: { type: Boolean, default: true },
  notifyOnListing: { type: Boolean, default: true }, // secondary market listing alert
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index: one tracker per user per product
GrailTrackerSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("GrailTracker", GrailTrackerSchema);
