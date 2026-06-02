const mongoose = require("mongoose");

const SpecSchema = new mongoose.Schema({
  Scale: { type: String, default: "1/7" },
  Height: { type: String, default: "25cm" },
  Material: { type: String, default: "ABS & PVC" }
}, { _id: false });

const ProductVariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "1/6 scale", "Limited Edition Gold"
  sku: { type: String, required: true },
  barcode: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }]
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String },
  barcode: { type: String },
  tags: [{ type: String }],
  variants: [ProductVariantSchema],
  images: [{ type: String, required: true }],
  videos: [{ type: String }], // Cloudinary or exterior media links
  specs: { type: SpecSchema, default: () => ({}) },
  gradient: { type: String, default: "linear-gradient(135deg, #120C1F, #000000)" },
  symbol: { type: String, default: "漢" },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  
  // Collector Meta
  rarity: { type: String, enum: ["Common", "Rare", "Super Rare", "Grail"], default: "Common" },
  limitedEdition: {
    isLimited: { type: Boolean, default: false },
    totalRun: { type: Number },
    releasedUnits: { type: Number }
  },
  releaseDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["In-Stock", "Pre-Order", "Out-of-Stock", "Discontinued"], default: "In-Stock" },
  
  // Value History
  marketValueHistory: [{
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }],

  // SEO & Open Graph Meta
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  ogMetadata: {
    title: { type: String },
    description: { type: String },
    image: { type: String }
  }
}, {
  timestamps: true
});

// Optimization Indexes
ProductSchema.index({ title: "text", description: "text" });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ status: 1 });

module.exports = mongoose.model("Product", ProductSchema);

