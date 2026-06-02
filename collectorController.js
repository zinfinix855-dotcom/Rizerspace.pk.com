const Collection = require("../models/Collection");
const User = require("../models/User");
const Product = require("../models/Product");

// Get a collector's public/private showcase shelf
// @route   GET /api/collector/showcase/:userId
// @access  Public
const getShowcase = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("name collectorLevel collectorXP badges publicShowcase loyaltyPoints");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return empty if private and requester is not the user
    if (!user.publicShowcase && (!req.user || req.user._id.toString() !== userId)) {
      return res.status(403).json({ error: "This collector's showcase is set to private." });
    }

    let collection = await Collection.findOne({ user: userId }).populate("items.product");
    
    if (!collection) {
      // Return a blank structure so the frontend knows there's a shelf ready
      collection = { items: [] };
    }

    // Calculate total showcase stats
    const totalItems = collection.items.length;
    let totalAcquisitionValue = 0;
    let currentEstValue = 0;
    
    const itemsWithEst = collection.items.map(item => {
      totalAcquisitionValue += item.acquisitionPrice || 0;
      // Current estimated price from catalog or fall back to acquisition
      const estPrice = item.product ? (item.product.discountedPrice || item.product.price) : item.acquisitionPrice;
      currentEstValue += estPrice;
      
      return {
        ...item.toObject ? item.toObject() : item,
        estimatedCurrentValue: estPrice
      };
    });

    res.json({
      collector: {
        id: user._id,
        name: user.name,
        level: user.collectorLevel,
        xp: user.collectorXP,
        badges: user.badges,
        loyaltyPoints: user.loyaltyPoints,
        publicShowcase: user.publicShowcase
      },
      showcase: {
        items: itemsWithEst,
        totalItems,
        totalAcquisitionValue: Number(totalAcquisitionValue.toFixed(2)),
        currentEstimatedValue: Number(currentEstValue.toFixed(2))
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add a figure to the logged in user's shelf + trigger XP progression & Badge Unlocks!
// @route   POST /api/collector/collection/add
// @access  Private
const addToCollection = async (req, res, next) => {
  try {
    const { productId, acquisitionPrice, condition, serialNumber } = req.body;
    const userId = req.user._id;

    if (!productId || !acquisitionPrice) {
      return res.status(400).json({ error: "Product ID and acquisition price are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Figure not found in catalog" });
    }

    let collection = await Collection.findOne({ user: userId });
    if (!collection) {
      collection = new Collection({ user: userId, items: [] });
    }

    // Add figure to shelf
    collection.items.push({
      product: productId,
      acquisitionPrice: Number(acquisitionPrice),
      condition: condition || "MISB",
      serialNumber: serialNumber || ""
    });
    await collection.save();

    // ── XP & Level-Up Progression ───────────────────────────────────────────
    const user = await User.findById(userId);
    
    // Gain +100 XP per figure added
    const xpGained = 100;
    user.collectorXP += xpGained;
    
    // Level up calculation: e.g. level = floor(XP / 300) + 1
    const oldLevel = user.collectorLevel;
    const newLevel = Math.floor(user.collectorXP / 300) + 1;
    
    let levelUpMessage = "";
    if (newLevel > oldLevel) {
      user.collectorLevel = newLevel;
      levelUpMessage = `🎉 CONGRATULATIONS! You leveled up to Level ${newLevel}!`;
      
      // Auto-unlock special collector achievement badges based on level
      const levelBadges = {
        2: { name: "Rookie Collector", icon: "🌱" },
        3: { name: "Elite Custodian", icon: "⭐" },
        4: { name: "Master Curator", icon: "🏆" },
        5: { name: "Grail Lord", icon: "👑" }
      };

      const newBadge = levelBadges[newLevel];
      if (newBadge) {
        // Only push if badge doesn't exist
        const hasBadge = user.badges.some(b => b.name === newBadge.name);
        if (!hasBadge) {
          user.badges.push(newBadge);
          levelUpMessage += ` Unlocked achievement badge: ${newBadge.name} ${newBadge.icon}!`;
        }
      }
    }

    // Award loyalty points (+10 per figure)
    user.loyaltyPoints += 10;
    await user.save();

    // Fetch the updated showcase populated
    const updatedCollection = await Collection.findOne({ user: userId }).populate("items.product");

    res.status(201).json({
      message: `Figure added to showcase cabinet shelf. +${xpGained} XP. ${levelUpMessage}`,
      user: {
        collectorLevel: user.collectorLevel,
        collectorXP: user.collectorXP,
        badges: user.badges,
        loyaltyPoints: user.loyaltyPoints
      },
      showcase: updatedCollection
    });

  } catch (error) {
    next(error);
  }
};

// Remove a figure from the user's shelf
// @route   DELETE /api/collector/collection/:itemId
// @access  Private
const removeFromCollection = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const collection = await Collection.findOne({ user: userId });
    if (!collection) {
      return res.status(404).json({ error: "Showcase not found" });
    }

    const initialLength = collection.items.length;
    collection.items = collection.items.filter(item => item._id.toString() !== itemId);

    if (collection.items.length === initialLength) {
      return res.status(404).json({ error: "Showcase item not found on shelf" });
    }

    await collection.save();
    
    const populated = await Collection.findOne({ user: userId }).populate("items.product");

    res.json({
      message: "Figure removed from showcase shelf successfully.",
      showcase: populated
    });
  } catch (error) {
    next(error);
  }
};

// Get a collector's public profile by referralCode slug (username)
// @route   GET /api/collector/profile/:username
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Look up by referralCode (used as the public username slug)
    const user = await User.findOne({ referralCode: username.toUpperCase() })
      .select("name collectorLevel collectorXP badges publicShowcase loyaltyPoints referralCode createdAt");

    if (!user) {
      return res.status(404).json({ error: "Collector profile not found" });
    }

    if (!user.publicShowcase) {
      return res.status(403).json({ error: "This collector has set their profile to private." });
    }

    let collection = await Collection.findOne({ user: user._id }).populate("items.product");
    if (!collection) collection = { items: [] };

    const totalItems = collection.items.length;
    let totalAcquisitionValue = 0;
    let currentEstValue = 0;

    const itemsWithEst = (collection.items || []).map(item => {
      totalAcquisitionValue += item.acquisitionPrice || 0;
      const estPrice = item.product ? (item.product.discountedPrice || item.product.price) : item.acquisitionPrice;
      currentEstValue += estPrice;
      return { ...item.toObject(), estimatedCurrentValue: estPrice };
    });

    res.json({
      collector: {
        id: user._id,
        name: user.name,
        username: user.referralCode,
        level: user.collectorLevel,
        xp: user.collectorXP,
        badges: user.badges,
        loyaltyPoints: user.loyaltyPoints,
        memberSince: user.createdAt
      },
      showcase: {
        items: itemsWithEst,
        totalItems,
        totalAcquisitionValue: Number(totalAcquisitionValue.toFixed(2)),
        currentEstimatedValue: Number(currentEstValue.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowcase,
  getPublicProfile,
  addToCollection,
  removeFromCollection
};
