const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

//  MongoDB Connection 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopdb';
mongoose.connect(MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB error:', err));

//  Schemas & Models 
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  image:       { type: String, required: true },
  category:    { type: String, required: true },
  description: { type: String, default: '' },
  stock:       { type: Number, default: 100 },
});

const cartItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  image:      { type: String, required: true },
  quantity:   { type: Number, required: true, min: 1, default: 1 },
  addedAt:    { type: Date, default: Date.now },
});

const Product  = mongoose.model('Product',  productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Product Routes 
// READ all products (+ optional category filter)
app.get('/api/products', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE product (admin)
app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cart Routes 
// READ cart
app.get('/api/cart', async (req, res) => {
  try {
    const items = await CartItem.find().sort({ addedAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE / add to cart (merge if exists)
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, name, price, image, quantity = 1 } = req.body;
    let item = await CartItem.findOne({ productId });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({ productId, name, price, image, quantity });
    }
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await CartItem.findByIdAndDelete(req.params.id);
      return res.json({ deleted: true });
    }
    const item = await CartItem.findByIdAndUpdate(
      req.params.id, { quantity }, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE cart item
app.delete('/api/cart/:id', async (req, res) => {
  try {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE all cart items (clear cart)
app.delete('/api/cart', async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//  SPA fallback 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
