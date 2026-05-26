require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopdb';

const productSchema = new mongoose.Schema({
  name: String, price: Number, image: String,
  category: String, description: String, stock: Number,
});
const userSchema = new mongoose.Schema({
  username: String, email: String, password: String,
  role: { type: String, default: 'user' },
});
const cartSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, items: Array });
const Product = mongoose.model('Product', productSchema);
const User    = mongoose.model('User', userSchema);
const Cart    = mongoose.model('Cart', cartSchema);

const products = [
  {
    name: 'Wireless noise-canceling headphones',
    price: 91,
    image: 'https://img.kwcdn.com/product/fancy/3d4ba0cf-6e6c-4e60-aae3-c163a2c96bd4.jpg?imageView2/2/w/800/q/70/format/avif',
    category: 'electronics',
    description: 'Active noise cancellation, 40-hour battery life, Hi-Fi sound quality',
    stock: 50,
  },
  {
    name: 'Smartwatch',
    price: 850,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    category: 'electronics',
    description: 'Light and portable, with high and low heart rate notifications',
    stock: 30,
  },
  {
    name: 'Portable Bluetooth speaker',
    price: 186,
    image: 'https://m.media-amazon.com/images/I/71zxyLl5B7L._AC_SY300_SX300_QL70_ML2_.jpg',
    category: 'electronics',
    description: 'Powerful JBL Pro Sound with AI Sound Boost, Up to 28 Hours of Playtime, Waterproof, dustproof, and Drop-Proof',
    stock: 80,
  },
  {
    name: 'Mechanical keyboard',
    price: 114,
    image: 'https://m.media-amazon.com/images/I/614U66QoZQL._AC_SY300_SX300_QL70_ML2_.jpg',
    category: 'electronics',
    description: 'EPOMAKER Ajazz AK820 Pro 75% Gasket-Mounted Mechanical Keyboard with TFT Screen, 3 Modes(BT/2.4G Wireless & Type-C Wired)',
    stock: 45,
  },
  {
    name: 'Sweatshirt',
    price: 600,
    image: 'https://www.untouchedworld.com/cdn/shop/files/1744-CassumHalfZipSweater-Stone-CASSUM26-Juan-032.jpg?v=1773623015&width=740',
    category: 'clothing',
    description: 'Crafted from a considered blend of Merino, Possum, Cashmere and Silk, it delivers remarkable warmth without weight.',
    stock: 100,
  },
  {
    name: 'Sweatpants',
    price: 940,
    image: 'https://media.brunellocucinelli.com/image/upload/f_auto,q_auto,dpr_auto/c_scale,w_1000/t_bc_sfcc_v_image/v1772092183/prod/seecommerce/original/261BW863E347-C9300-D.jpeg?_i=AG',
    category: 'clothing',
    description: 'Soft techno cotton French terry trousers with pull-on fit and elasticized drawstring.',
    stock: 150,
  },
  {
    name: 'Running shoes',
    price: 280,
    image: 'https://m.media-amazon.com/images/I/51-nA96rEsL._AC_SY625_.jpg',
    category: 'clothing',
    description: 'Engineered knit upper, FF BLAST PLUS cushioning for cloud-like comfort and responsive ride.',
    stock: 90,
  },
  {
    name: 'Espresso Blend',
    price: 75,
    image: 'https://stali.com.au/cdn/shop/files/1KGORTH_c1e54069-b6f7-4b71-bab3-b317e122aee9.png?v=1752197507&width=713',
    category: 'food',
    description: 'With notes of chocolate, caramel butterscotch and apple. Familiar, reliable, and endlessly satisfying.',
    stock: 300,
  },
  {
    name: 'Chocolate gift box',
    price: 190,
    image: 'https://seescandies.com.au/cdn/shop/files/assorted-chocolates-all-year-2lb-alt1_1.jpg?v=1774475996&width=1200',
    category: 'food',
    description: 'About 26 pieces of irresistible mix: Milk Bordeaux, Dark Scotchmallow, Milk Almond Caramel, and more.',
    stock: 120,
  },
  {
    name: 'Organic mixed nuts pack',
    price: 35,
    image: 'https://m.media-amazon.com/images/I/81LcBjzDhUL._AC_SX300_SY300_QL70_ML2_.jpg',
    category: 'food',
    description: 'Premium Mix of Almond, Cranberries, White Choc Gems, Pistachio Kernels — 21 x 35g Bags.',
    stock: 250,
  },
  {
    name: 'Table lamp',
    price: 385,
    image: 'https://www.designbythem.com/cdn/shop/files/DBT-Parcel--109125.jpg?v=1763595417&width=840',
    category: 'home',
    description: 'Portable lamp with 3 diffused light settings, changeable with a gentle tap. Lightweight aluminium.',
    stock: 60,
  },
  {
    name: 'Scented candle set',
    price: 575,
    image: 'https://www.brandedcandles.com.au/cdn/shop/files/Custom_Candle_with_printed_jar_and_packaging_2.jpg?v=1732685424&width=1800',
    category: 'home',
    description: '350gm of wax/fragrance, 50 hour burn time. Exquisite fragrance for any room.',
    stock: 80,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Seed products
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(` Seeded ${products.length} products`);

  // Clear all carts to avoid orphaned 'Deleted user' records
  await Cart.deleteMany({});
  console.log(' Carts cleared');

  // Create admin user
  await User.deleteMany({ email: 'admin@shop.com' });
  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', email: 'admin@shop.com', password: hashed, role: 'admin' });
  console.log(' Admin created    email: admin@shop.com  |  password: admin123');

  await mongoose.disconnect();
  console.log(' Seed complete!');
}

seed().catch(e => { console.error(e); process.exit(1); });
