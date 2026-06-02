const Collection = require("../models/Collection");
const Product = require("../models/Product");

// @desc  "Collectors who own this also own..." — collaborative filtering
// @route GET /api/recommendations/:productId
// @access Public
const getCollaborativeRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);

    // Step 1: Find all collections that contain this product
    const collectionsWithProduct = await Collection.find({
      "items.product": productId
    }).select("user items");

    if (collectionsWithProduct.length === 0) {
      // Fallback: return products from same category
      const sourceProduct = await Product.findById(productId);
      if (!sourceProduct) return res.status(404).json({ error: "Product not found" });

      const fallback = await Product.find({
        _id: { $ne: productId },
        category: sourceProduct.category
      }).limit(limit);

      return res.json({ data: fallback, source: "category-fallback" });
    }

    // Step 2: Aggregate all other product IDs from those collections
    const productFrequency = {};
    for (const col of collectionsWithProduct) {
      for (const item of col.items) {
        const pid = item.product.toString();
        if (pid === productId) continue;
        productFrequency[pid] = (productFrequency[pid] || 0) + 1;
      }
    }

    // Step 3: Sort by frequency — most co-owned first
    const sortedIds = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (sortedIds.length === 0) {
      const sourceProduct = await Product.findById(productId);
      const fallback = await Product.find({
        _id: { $ne: productId },
        category: sourceProduct?.category
      }).limit(limit);
      return res.json({ data: fallback, source: "category-fallback" });
    }

    // Step 4: Fetch the actual product documents, preserving frequency order
    const products = await Product.find({ _id: { $in: sortedIds } });
    const ordered = sortedIds
      .map(id => products.find(p => p._id.toString() === id))
      .filter(Boolean);

    res.json({ data: ordered, source: "collaborative", matchedCollectors: collectionsWithProduct.length });
  } catch (error) {
    next(error);
  }
};

// @desc  Personalized "For You" feed based on user's collection categories + rarities
// @route GET /api/recommendations/for-you
// @access Private
const getPersonalizedFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);

    // Get the user's current collection
    const collection = await Collection.findOne({ user: userId }).populate("items.product");

    if (!collection || collection.items.length === 0) {
      // Cold-start: return top-rated Grail/Super Rare figures
      const popular = await Product.find({ rarity: { $in: ["Grail", "Super Rare"] } })
        .sort({ averageRating: -1 })
        .limit(limit);
      return res.json({ data: popular, source: "cold-start-popular" });
    }

    // Extract already-owned product IDs
    const ownedIds = collection.items.map(i => i.product?._id?.toString()).filter(Boolean);

    // Build preference profile from collection
    const categoryCount = {};
    const rarityCount = {};

    for (const item of collection.items) {
      if (!item.product) continue;
      const cat = item.product.category;
      const rar = item.product.rarity;
      if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      if (rar) rarityCount[rar] = (rarityCount[rar] || 0) + 1;
    }

    // Sort by preference strength
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const topRarities = Object.entries(rarityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([rar]) => rar);

    // Find products matching the collector's taste profile, excluding owned
    const recommendations = await Product.find({
      _id: { $nin: ownedIds },
      $or: [
        { category: { $in: topCategories } },
        { rarity: { $in: topRarities } }
      ]
    })
      .sort({ averageRating: -1, "limitedEdition.isLimited": -1 })
      .limit(limit);

    res.json({
      data: recommendations,
      source: "personalized",
      profile: { topCategories, topRarities }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCollaborativeRecommendations, getPersonalizedFeed };
