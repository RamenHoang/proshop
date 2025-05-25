import asyncHandler from '../middleware/asyncHandler.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  const categoryExists = await Category.findOne({ name });
  
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }
  
  const category = new Category({
    name,
    description,
    user: req.user._id,
  });
  
  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  const category = await Category.findById(req.params.id);
  
  if (category) {
    // Check if the new name already exists and it's not the current category
    if (name !== category.name) {
      const nameExists = await Category.findOne({ name });
      if (nameExists) {
        res.status(400);
        throw new Error('Category name already exists');
      }
    }
    
    category.name = name || category.name;
    category.description = description || category.description;
    
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (category) {
    // Check if any products are using this category
    const productsWithCategory = await Product.countDocuments({ category: category._id });
    
    if (productsWithCategory > 0) {
      res.status(400);
      throw new Error(`Cannot delete category: ${productsWithCategory} products are using it`);
    }
    
    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Get all categories (admin)
// @route   GET /api/categories/admin
// @access  Private/Admin
const getAdminCategories = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT || 10;
  const page = Number(req.query.pageNumber) || 1;
  
  // Create filter object based on query parameters
  const filters = {};
  
  // Filter by name
  if (req.query.name) {
    filters.name = { $regex: req.query.name, $options: 'i' };
  }
  
  // Filter by creation date range
  if (req.query.startDate) {
    filters.createdAt = { ...filters.createdAt, $gte: new Date(req.query.startDate) };
  }
  if (req.query.endDate) {
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1); // Include the end date
    filters.createdAt = { ...filters.createdAt, $lt: endDate };
  }

  const count = await Category.countDocuments(filters);
  
  const categories = await Category.find(filters)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ name: 1 });
  
  res.json({ categories, page, pages: Math.ceil(count / pageSize) });
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminCategories,
};
