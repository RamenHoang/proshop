import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateDeliveryStatus,
  getOrders,
  createVnpayPayment,
  handleVnpayReturn,
  handleCodOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/mine').get(protect, getMyOrders);

// VNPay and COD routes
router.route('/:id/vnpay').post(protect, createVnpayPayment);
router.route('/vnpay-return').get(handleVnpayReturn);
router.route('/:id/cod').put(protect, handleCodOrder);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/delivery-status').put(protect, admin, updateDeliveryStatus);

export default router;
