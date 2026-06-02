const Product = require("../models/Product");

// @desc    Get all products with advanced filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, rating, sort, page = 1, limit = 12 } = req.query;
    let query = {};

    // Category Filter
    if (category && category !== "All") {
      query.category = new RegExp(`^${category}$`, "i");
    }

    // Search Query (title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Sort Logic
    let sortBy = { createdAt: -1 }; // Default: Newest first
    if (sort === "price-asc") sortBy = { price: 1 };
    else if (sort === "price-desc") sortBy = { price: -1 };
    else if (sort === "rating") sortBy = { averageRating: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      data: products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, price, discountedPrice, stock, specs, gradient, symbol } = req.body;
    let images = [];

    // Parse specs if received as JSON string from multipart/form-data
    let parsedSpecs = specs;
    if (typeof specs === "string") {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch (e) {
        parsedSpecs = {};
      }
    }

    // Check if images uploaded
    if (req.files && req.files.length > 0) {
      const { uploadToCloudinary } = require("../utils/cloudinary");
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        images.push(url);
      }
    } else if (req.body.images) {
      // Direct string array (JSON request support)
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      // Default fallback
      images = ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500"];
    }

    const product = await Product.create({
      title,
      description,
      category,
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
      stock: Number(stock),
      images,
      specs: parsedSpecs,
      gradient,
      symbol
    });

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const fieldsToUpdate = [
      "title", "description", "category", "price", "discountedPrice",
      "stock", "gradient", "symbol"
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Handle specs update
    if (req.body.specs) {
      let parsedSpecs = req.body.specs;
      if (typeof req.body.specs === "string") {
        try {
          parsedSpecs = JSON.parse(req.body.specs);
        } catch (e) {}
      }
      product.specs = { ...product.specs, ...parsedSpecs };
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const { uploadToCloudinary } = require("../utils/cloudinary");
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        newImages.push(url);
      }
      product.images = newImages;
    } else if (req.body.images) {
      product.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const updatedProduct = await product.save();
    res.json({ data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
