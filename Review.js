const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

// Prevent user from submitting multiple reviews for the same product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating and number of reviews
ReviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model("Product").findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].nRating
      });
    } else {
      await mongoose.model("Product").findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error("Error in calculating average rating:", err);
  }
};

// Calculate average rating after a review is created or updated
ReviewSchema.post("save", async function() {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
