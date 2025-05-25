import express from 'express';
const router = express.Router();
import {
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
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

// Special routes that shouldn't go through checkObjectId
// These must be defined BEFORE the general routes to prevent "admin" from being treated as an id
router.route('/admin').get(protect, admin, getAdminProducts);
router.get('/top', getTopProducts);
router.get('/newest', getNewestProducts);
router.get('/categories', getProductCategories);
router.get('/bestsellers', getBestSellerProducts);

// Default routes
router
  .route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router
  .route('/:id')
  .get(checkObjectId, getProductById)
  .put(protect, admin, checkObjectId, updateProduct)
  .delete(protect, admin, checkObjectId, deleteProduct);

router.route('/:id/reviews').post(protect, checkObjectId, createProductReview);

export default router;
