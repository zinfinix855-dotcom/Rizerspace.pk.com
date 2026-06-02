const Product = require("../models/Product");
const Order = require("../models/Order");
const GrailTracker = require("../models/GrailTracker");
const User = require("../models/User");

// @desc  Inventory intelligence — stock levels, sell-through, restock flags
// @route GET /api/admin/analytics/inventory
// @access Admin
const getInventoryIntelligence = async (req, res, next) => {
  try {
    const products = await Product.find({}).select(
      "title category rarity status stock price discountedPrice limitedEdition averageRating numReviews createdAt"
    ).sort({ stock: 1 });

    // Compute sell-through estimate (low stock = high demand proxy)
    const enriched = products.map(p => {
      const price = p.discountedPrice || p.price;
      const stockStatus =
        p.stock === 0 ? "depleted" :
        p.stock <= 3  ? "critical" :
        p.stock <= 10 ? "low"      : "healthy";

      return {
        _id: p._id,
        title: p.title,
        category: p.category,
        rarity: p.rarity,
        status: p.status,
        stock: p.stock,
        price,
        stockStatus,
        needsRestock: p.stock <= 5,
        isLimited: p.limitedEdition?.isLimited || false,
        totalRun: p.limitedEdition?.totalRun,
        averageRating: p.averageRating,
        numReviews: p.numReviews
      };
    });

    // Summary counts
    const summary = {
      total: enriched.length,
      depleted: enriched.filter(p => p.stockStatus === "depleted").length,
      critical: enriched.filter(p => p.stockStatus === "critical").length,
      low: enriched.filter(p => p.stockStatus === "low").length,
      healthy: enriched.filter(p => p.stockStatus === "healthy").length,
      needsRestock: enriched.filter(p => p.needsRestock).length,
    };

    res.json({ summary, products: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc  Demand intelligence — most-tracked Grails, most-wishlisted
// @route GET /api/admin/analytics/demand
// @access Admin
const getDemandIntelligence = async (req, res, next) => {
  try {
    // Most tracked grails (from GrailTracker)
    const grailDemand = await GrailTracker.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$product", trackerCount: { $sum: 1 }, restockWatchers: { $sum: { $cond: ["$notifyOnRestock", 1, 0] } }, priceWatchers: { $sum: { $cond: [{ $ne: ["$targetPrice", null] }, 1, 0] } } } },
      { $sort: { trackerCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { trackerCount: 1, restockWatchers: 1, priceWatchers: 1, "product.title": 1, "product.rarity": 1, "product.stock": 1, "product.price": 1, "product.status": 1 } }
    ]);

    // Most wishlisted (from User.wishlist)
    const wishlistDemand = await User.aggregate([
      { $unwind: "$wishlist" },
      { $group: { _id: "$wishlist", wishCount: { $sum: 1 } } },
      { $sort: { wishCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { wishCount: 1, "product.title": 1, "product.rarity": 1, "product.stock": 1, "product.price": 1 } }
    ]);

    // Platform stats
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });

    res.json({
      platform: { totalUsers, totalProducts, outOfStock },
      grailDemand,
      wishlistDemand
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventoryIntelligence, getDemandIntelligence };
