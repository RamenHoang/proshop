import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';
import { createPaymentUrl, validateReturnData } from '../config/vnpay.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Create order
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Update product inventory and sales
    for (const item of orderItems) {
      const product = await Product.findById(item._id);
      if (product) {
        // Decrease inventory
        product.countInStock -= item.qty;
        // Increase sales
        product.numSales = (product.numSales || 0) + item.qty;
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  // NOTE: here we need to verify the payment was made to PayPal before marking
  // the order as paid
  const { verified, value } = await verifyPayPalPayment(req.body.id);
  if (!verified) throw new Error('Payment not verified');

  // check if this transaction has been used before
  const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
  if (!isNewTransaction) throw new Error('Transaction has been used before');

  const order = await Order.findById(req.params.id);

  if (order) {
    // check the correct amount was paid
    const paidCorrectAmount = (order.totalPrice / 25000).toFixed(2).toString() === value;
    if (!paidCorrectAmount) throw new Error('Incorrect amount paid');

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order delivery status
// @route   PUT /api/orders/:id/delivery-status
// @access  Private/Admin
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { deliveryStatus, comment } = req.body;
  
  const order = await Order.findById(req.params.id);

  if (order) {
    // Update the delivery status
    order.deliveryStatus = deliveryStatus;
    
    // Add to status history
    order.statusHistory.push({
      status: deliveryStatus,
      date: Date.now(),
      comment: comment || '',
      updatedBy: req.user._id,
    });

    // If status is "Delivered", also update isDelivered and deliveredAt
    if (deliveryStatus === 'Delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    // If status is changed from "Delivered" to something else
    if (deliveryStatus !== 'Delivered' && order.isDelivered) {
      order.isDelivered = false;
      order.deliveredAt = null;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Create VNPay payment URL
// @route   POST /api/orders/:id/vnpay
// @access  Private
const createVnpayPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Create VNPay payment URL
  const ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress;
  
  const paymentUrl = createPaymentUrl(
    order._id.toString(),
    order.totalPrice,
    `Payment for order ${order._id}`,
    ipAddr
  );

  console.log('VNPay payment URL:', paymentUrl);
  
  res.json({ paymentUrl });
});

// @desc    Handle VNPay payment return
// @route   GET /api/orders/vnpay-return
// @access  Public
const handleVnpayReturn = asyncHandler(async (req, res) => {
  const vnpParams = req.query;
  
  // Validate the return data
  const isValidSignature = validateReturnData(vnpParams);
  
  if (!isValidSignature) {
    res.status(400);
    throw new Error('Invalid payment data');
  }
  
  // Get order information
  const orderId = vnpParams.vnp_TxnRef.split('_')[0];
  const transactionStatus = vnpParams.vnp_ResponseCode;
  
  const order = await Order.findById(orderId);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if payment was successful (00 is success code)
  if (transactionStatus === '00') {
    order.isPaid = true;
    order.paidAt = Date.now();
    
    // Store the payment result
    order.paymentResult = {
      id: vnpParams.vnp_TransactionNo,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      vnp_TransactionNo: vnpParams.vnp_TransactionNo,
      vnp_ResponseCode: vnpParams.vnp_ResponseCode,
      vnp_OrderInfo: vnpParams.vnp_OrderInfo,
      vnp_PayDate: vnpParams.vnp_PayDate,
    };
    
    await order.save();
    
    res.redirect(
      `${process.env.FRONTEND_URL}/order/${orderId}?success=true&message=Payment successful`
    );
  } else {
    // Update to redirect with error message instead of throwing an error
    const errorMessage = `Payment failed with error code: ${transactionStatus}`;
    res.redirect(
      `${process.env.FRONTEND_URL}/order/${orderId}?success=false&message=${encodeURIComponent(errorMessage)}`
    );
  }
});

// @desc    Handle COD order
// @route   PUT /api/orders/:id/cod
// @access  Private
const handleCodOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Update order with COD information
  order.paymentMethod = 'COD';
  
  // COD orders are not paid until delivery
  order.isPaid = true;
  // order.deliveryStatus = 'Processing';
  
  // Add to status history
  // order.statusHistory.push({
  //   status: 'Processing',
  //   date: Date.now(),
  //   comment: 'Order placed with Cash on Delivery',
  //   updatedBy: req.user._id,
  // });
  
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateDeliveryStatus,
  createVnpayPayment,
  handleVnpayReturn,
  handleCodOrder,
  getOrders,
};
