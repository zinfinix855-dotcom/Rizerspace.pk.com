const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true, min: 0 },
  condition: { type: String, enum: ["MISB", "MIB", "Loose"], required: true },
  description: { type: String },
  images: [{ type: String }],
  status: { type: String, enum: ["Active", "Sold", "Cancelled"], default: "Active" }
}, {
  timestamps: true
});

module.exports = mongoose.model("Listing", ListingSchema);
