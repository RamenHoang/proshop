import dotenv from 'dotenv';
import colors from 'colors';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const migrateCategoryData = async () => {
  try {
    console.log('Starting category migration...'.yellow.bold);
    
    // Find admin user to associate with categories
    const adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      console.error('No admin user found to associate with categories'.red.bold);
      process.exit(1);
    }
    
    // Get unique categories from products
    const products = await Product.find({});
    const uniqueCategoryNames = [...new Set(products.map(p => p.category))];

    console.log({uniqueCategoryNames});
    
    console.log(`Found ${uniqueCategoryNames.length} unique categories`.cyan);
    
    // Create category documents for each unique category
    const categoryMap = {};
    
    for (const categoryName of uniqueCategoryNames) {
      if (!categoryName) continue;
      
      // Check if category already exists
      let category = await Category.findOne({ name: categoryName });
      
      if (!category) {
        // Create new category
        category = await Category.create({
          name: categoryName,
          description: `Migrated from product data`,
          user: adminUser._id,
        });
        console.log(`Created category: ${categoryName}`.green);
      } else {
        console.log(`Category already exists: ${categoryName}`.yellow);
      }
      
      categoryMap[categoryName] = category._id;
    }
    
    // Update products with category references
    let updatedCount = 0;
    
    for (const product of products) {
      if (product.category && categoryMap[product.category]) {
        // Store original category name
        product.categoryName = product.category;
        
        // Update to use category reference
        product.categoryRef = categoryMap[product.categoryName];
        await product.save();
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} products with category references`.green.bold);
    console.log('Category migration completed successfully!'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    console.error(error.stack);
    process.exit(1);
  }
};

migrateCategoryData();
