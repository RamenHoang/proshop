import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Order from '../models/orderModel.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const migrateOrderStatus = async () => {
  try {
    console.log('Starting order status migration...'.yellow.bold);
    
    // Get all orders that don't have a deliveryStatus set
    const orders = await Order.find({ deliveryStatus: { $exists: false } });
    
    console.log(`Found ${orders.length} orders to migrate`.cyan);
    
    for (const order of orders) {
      // Set default status based on existing isDelivered field
      order.deliveryStatus = order.isDelivered ? 'Delivered' : 'Not Processed';
      
      // Initialize the status history with the current status
      order.statusHistory = [{
        status: order.deliveryStatus,
        date: order.isDelivered ? order.deliveredAt : order.createdAt,
        comment: 'Auto-migrated status',
      }];
      
      await order.save();
    }
    
    console.log('Order status migration completed successfully!'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

migrateOrderStatus();
