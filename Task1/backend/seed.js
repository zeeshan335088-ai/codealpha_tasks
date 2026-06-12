
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');
    
    const products = [
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        category: 'Electronics'
      },
      {
        name: 'Running Shoes',
        description: 'Comfortable running shoes for everyday use',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        category: 'Footwear'
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smart watch with health monitoring',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        category: 'Electronics'
      },
      {
        name: 'Backpack',
        description: 'Durable backpack for travel and daily use',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        category: 'Bags'
      },
      {
        name: 'Water Bottle',
        description: 'Insulated water bottle to keep drinks cold',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
        category: 'Home'
      },
      {
        name: 'Laptop Stand',
        description: 'Ergonomic laptop stand to improve posture',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        category: 'Electronics'
      }
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    
    console.log('Sample products added successfully');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
