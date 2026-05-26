require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/shopdb';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const PORT       = process.env.PORT       || 3000;

//  MONGOOSE SCHEMAS & MODELS

//  User 
const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

//  Product 
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  image:       { type: String, required: true },
  category:    { type: String, required: true },
  description: { type: String, default: '' },
  stock:       { type: Number, default: 100 },
});

const Product = mongoose.model('Product', productSchema);

//  Cart (per-user, embedded items) 
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  image:     { type: String, required: true },
  quantity:  { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:     [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

cartSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

const Cart = mongoose.model('Cart', cartSchema);

//  JWT MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
};

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// helper: get or create cart for a user
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

//  AUTH ROUTES

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'Username or email already taken' });
    const user = await User.create({ username, email, password });
    res.status(201).json({ token: signToken(user._id), user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: signToken(user._id), user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

// PUT /api/auth/me   update own profile
app.put('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { username }, { new: true });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

//  PRODUCT ROUTES

// GET /api/products?search=&category=
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }
    if (category && category !== 'all') filter.category = category;
    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/products  (admin)
app.post('/api/products', authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/products/:id  (admin)
app.put('/api/products/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/products/:id  (admin)
app.delete('/api/products/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//  CART ROUTES  (requires login)

// GET /api/cart
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/cart   add item
app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const { productId, name, price, image, quantity = 1 } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(i => i.productId.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, image, quantity });
    }
    await cart.save();
    res.status(201).json(cart);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/cart/:itemId   update quantity
app.put('/api/cart/:itemId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (quantity < 1) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json(cart);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/cart/:itemId   remove one item
app.delete('/api/cart/:itemId', authMiddleware, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.deleteOne();
    await cart.save();
    res.json(cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/cart   clear cart
app.delete('/api/cart', authMiddleware, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//  ADMIN ROUTES

// GET /api/admin/carts   all users' carts
app.get('/api/admin/carts', authMiddleware, adminOnly, async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate('userId', 'username email createdAt role')
      .sort({ updatedAt: -1 });
    // Filter out carts whose user has been deleted
    const validCarts = carts.filter(c => c.userId != null);
    res.json(validCarts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/users   all users
app.get('/api/admin/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//  SPA FALLBACK
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

//  START
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected');
    app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
  })
  .catch(err => { console.error(' MongoDB error:', err); process.exit(1); });
