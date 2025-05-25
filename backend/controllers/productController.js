import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const categoryFilter = {};
  if (req.query.category) {
    // Try to find category by ID first
    try {
      const category = await Category.findById(req.query.category);
      if (category) {
        categoryFilter.category = category._id;
      }
    } catch (err) {
      // If not a valid ObjectId, try to find by name
      const category = await Category.findOne({
        name: { $regex: new RegExp(`^${req.query.category}$`, 'i') },
      });
      if (category) {
        categoryFilter.categoryRef = category._id;
      }
    }
  }

  const count = await Product.countDocuments({
    ...keyword,
    ...categoryFilter,
  });

  const products = await Product.find({
    ...keyword,
    ...categoryFilter,
  })
    .populate('categoryRef', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const product = await Product.findById(req.params.id)
    .populate('categoryRef');
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Get default category or create one
  let defaultCategory = await Category.findOne({});
  if (!defaultCategory) {
    defaultCategory = await Category.create({
      name: 'Sample category',
      user: req.user._id,
    });
  }

  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    categoryRef: defaultCategory._id,
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;

    // Find category document and update product
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) {
        product.categoryRef = categoryDoc._id;
      } else {
        throw new Error('Category not found');
      }
    }

    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// @desc    Get newest products
// @route   GET /api/products/newest
// @access  Public
const getNewestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(3);
  res.json(products);
});

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  // Use the dedicated Category model instead of distinct
  const categories = await Category.find({}).select('name').sort({ name: 1 });
  res.json(categories.map((cat) => cat.name));
});

// @desc    Get best selling products
// @route   GET /api/products/bestsellers
// @access  Public
const getBestSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ numSales: { $gt: 0 } })
    .sort({ numSales: -1 })
    .limit(3);
  
  // // If there are not enough products with sales, fill with top rated products
  // if (products.length < 3) {
  //   const additionalProducts = await Product.find({
  //     _id: { $nin: products.map(p => p._id) }
  //   })
  //   .sort({ rating: -1 })
  //   .limit(3 - products.length);
    
  //   products.push(...additionalProducts);
  // }
  
  res.json(products);
});

// @desc    Get all products (admin)
// @route   GET /api/products/admin
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;
  
  // Create filter object based on query parameters
  const filters = {};
  
  // Filter by name
  if (req.query.name) {
    filters.name = { $regex: req.query.name, $options: 'i' };
  }
  
  // Filter by brand
  if (req.query.brand) {
    filters.brand = { $regex: req.query.brand, $options: 'i' };
  }
  
  // Filter by price range
  if (req.query.minPrice) {
    filters.price = { ...filters.price, $gte: Number(req.query.minPrice) };
  }
  if (req.query.maxPrice) {
    filters.price = { ...filters.price, $lte: Number(req.query.maxPrice) };
  }
  
  // Filter by category
  if (req.query.category) {
    // Import mongoose for ObjectId validation
    const mongoose = require('mongoose');
    
    // Check if the category is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(req.query.category)) {
      try {
        const category = await Category.findById(req.query.category);
        if (category) {
          filters.categoryRef = category._id;
        }
      } catch (err) {
        // Just log the error but don't break the request
        console.error('Error finding category by ID:', err);
      }
    } else {
      // If not a valid ObjectId, try to find by name
      try {
        const category = await Category.findOne({
          name: { $regex: new RegExp(`^${req.query.category}$`, 'i') }
        });
        if (category) {
          filters.categoryRef = category._id;
        }
      } catch (err) {
        console.error('Error finding category by name:', err);
      }
    }
  }
  
  // Filter by stock status
  if (req.query.inStock === 'true') {
    filters.countInStock = { $gt: 0 };
  } else if (req.query.inStock === 'false') {
    filters.countInStock = { $lte: 0 };
  }

  const count = await Product.countDocuments(filters);
  
  const products = await Product.find(filters)
    .populate('categoryRef', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getNewestProducts,
  getProductCategories,
  getBestSellerProducts,
  getAdminProducts,
};
