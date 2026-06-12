
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, address } = req.body;
    let cart = await Cart.findOne().populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));
    const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const order = new Order({
      items,
      total,
      customerName,
      customerEmail,
      address
    });
    await order.save();
    await order.populate('items.product');
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
