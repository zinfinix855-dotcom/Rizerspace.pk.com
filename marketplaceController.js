const Listing = require("../models/Listing");
const Product = require("../models/Product");

// Get active resale listings
// @route   GET /api/marketplace/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const { productId, condition, minPrice, maxPrice } = req.query;
    const filter = { status: "Active" };

    if (productId) {
      filter.product = productId;
    }
    if (condition) {
      filter.condition = condition;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate("product")
      .populate("seller", "name collectorLevel collectorXP badges")
      .sort({ createdAt: -1 });

    res.json({ data: listings, total: listings.length });
  } catch (error) {
    next(error);
  }
};

// Create a new resale listing
// @route   POST /api/marketplace/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const { productId, price, condition, description, images } = req.body;
    const sellerId = req.user._id;

    if (!productId || !price || !condition) {
      return res.status(400).json({ error: "Product, price and condition are required." });
    }

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found in catalog." });
    }

    const listing = await Listing.create({
      seller: sellerId,
      product: productId,
      price: Number(price),
      condition,
      description,
      images: images || [],
      status: "Active"
    });

    const populated = await Listing.findById(listing._id)
      .populate("product")
      .populate("seller", "name collectorLevel");

    res.status(201).json({ data: populated });
  } catch (error) {
    next(error);
  }
};

// Update listing status (Active, Sold, Cancelled)
// @route   PUT /api/marketplace/listings/:id/status
// @access  Private
const updateListingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["Active", "Sold", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Resale listing not found." });
    }

    // Verify requester is the owner of the listing
    if (listing.seller.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to modify this listing." });
    }

    listing.status = status;
    await listing.save();

    res.json({ message: `Listing status successfully updated to ${status}.`, data: listing });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  createListing,
  updateListingStatus
};
