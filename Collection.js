const mongoose = require("mongoose");

const CollectionItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  acquisitionPrice: { type: Number, required: true },
  serialNumber: { type: String }, // e.g. "042 / 500"
  condition: { type: String, enum: ["MISB", "MIB", "Loose"], default: "MISB" },
  addedAt: { type: Date, default: Date.now }
}, { _id: true });

const CollectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [CollectionItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("Collection", CollectionSchema);
