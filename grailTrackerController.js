const GrailTracker = require("../models/GrailTracker");
const Product = require("../models/Product");
const emailService = require("../services/emailService");
const User = require("../models/User");

// Get authenticated user's active grail trackers
// @route   GET /api/grail-tracker
// @access  Private
const getMyTrackers = async (req, res, next) => {
  try {
    const trackers = await GrailTracker.find({ user: req.user._id, isActive: true })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json({ data: trackers, total: trackers.length });
  } catch (error) {
    next(error);
  }
};

// Add or update a grail tracker for a product
// @route   POST /api/grail-tracker
// @access  Private
const upsertTracker = async (req, res, next) => {
  try {
    const { productId, targetPrice, notifyOnRestock, notifyOnListing } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Upsert: create or update existing tracker for this user+product combination
    const tracker = await GrailTracker.findOneAndUpdate(
      { user: userId, product: productId },
      {
        targetPrice: targetPrice ? Number(targetPrice) : null,
        notifyOnRestock: notifyOnRestock !== undefined ? notifyOnRestock : true,
        notifyOnListing: notifyOnListing !== undefined ? notifyOnListing : true,
        isActive: true
      },
      { upsert: true, new: true }
    ).populate("product");

    res.status(201).json({
      message: `Grail tracker activated for "${product.title}". You'll be notified when your conditions are met.`,
      data: tracker
    });
  } catch (error) {
    next(error);
  }
};

// Remove (deactivate) a grail tracker
// @route   DELETE /api/grail-tracker/:id
// @access  Private
const removeTracker = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tracker = await GrailTracker.findOne({ _id: id, user: req.user._id });
    if (!tracker) {
      return res.status(404).json({ error: "Tracker not found" });
    }

    tracker.isActive = false;
    await tracker.save();

    res.json({ message: "Grail tracker deactivated." });
  } catch (error) {
    next(error);
  }
};

// Internal utility: check all trackers for a product and fire alerts
// Called when a product's stock or price changes (e.g. during order fulfillment)
const checkGrailAlerts = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const activeTrackers = await GrailTracker.find({
      product: productId,
      isActive: true
    }).populate("user");

    for (const tracker of activeTrackers) {
      const user = tracker.user;
      if (!user || !user.email) continue;

      let shouldAlert = false;
      let alertReason = "";

      // Restock alert
      if (tracker.notifyOnRestock && product.stock > 0) {
        shouldAlert = true;
        alertReason = `"${product.title}" is now back In Stock!`;
      }

      // Price drop alert
      const currentPrice = product.discountedPrice || product.price;
      if (tracker.targetPrice && currentPrice <= tracker.targetPrice) {
        shouldAlert = true;
        alertReason = `"${product.title}" has dropped to your target price of $${tracker.targetPrice}. Current price: $${currentPrice}.`;
      }

      if (shouldAlert) {
        await emailService.sendGrailAlert(user.email, user.name, product.title, alertReason);
      }
    }
  } catch (err) {
    console.error("Grail alert check error:", err.message);
  }
};

// Admin view: most-tracked Grails (demand intelligence)
// @route   GET /api/grail-tracker/demand
// @access  Admin
const getDemandLeaderboard = async (req, res, next) => {
  try {
    const demand = await GrailTracker.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$product", trackerCount: { $sum: 1 } } },
      { $sort: { trackerCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { trackerCount: 1, "product.title": 1, "product.rarity": 1, "product.stock": 1, "product.price": 1 } }
    ]);

    res.json({ data: demand });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyTrackers, upsertTracker, removeTracker, checkGrailAlerts, getDemandLeaderboard };
