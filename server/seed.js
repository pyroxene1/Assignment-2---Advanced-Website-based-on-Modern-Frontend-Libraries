const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopdb';

const productSchema = new mongoose.Schema({
  name: String, price: Number, image: String,
  category: String, description: String, stock: Number,
});
const Product = mongoose.model('Product', productSchema);

const products = [
  //  Electronics 
  {
    name: 'Wireless noise-canceling headphones',
    price: 91,
    image: 'https://img.kwcdn.com/product/fancy/3d4ba0cf-6e6c-4e60-aae3-c163a2c96bd4.jpg?imageView2/2/w/800/q/70/format/avif',
    category: 'electronics',
    description: 'Active noise cancellation, 40-hour battery life, Hi-Fi sound quality',
    stock: 50,
  },
  {
    name: ' Smartwatch',
    price: 850,
    image: 'https://www.optus.com.au/content/dam/optus/cloud/images/shop/watches/apple/apple-watch-series-11/sd-01-watch-11-42mm-rosegold-sportsband-lightblush-angle.version-1757469361055.jpg',
    category: 'electronics',
    description: 'Light and portable, with high and low heart rate notifications',
    stock: 30,
  },
  {
    name: 'Portable Bluetooth speaker',
    price: 186,
    image: 'https://m.media-amazon.com/images/I/71zxyLl5B7L._AC_SY300_SX300_QL70_ML2_.jpg',
    category: 'electronics',
    description: 'Powerful JBL Pro Sound with AI Sound Boost, Up to 28 Hours of Playtime, Multi-Speaker Connection by Auracast, Waterproof, dustproof, and Drop-Proof, Black',
    stock: 80,
  },
  {
    name: 'mechanical keyboard',
    price: 114,
    image: 'https://m.media-amazon.com/images/I/614U66QoZQL._AC_SY300_SX300_QL70_ML2_.jpg',
    category: 'electronics',
    description: 'EPOMAKER Ajazz AK820 Pro 75% Gasket-Mounted Mechanical Keyboard with TFT Screen, 3 Modes(BT/2.4G Wireless & Type-C Wired), Sound Dampening Foams (Grey, Ajazz Gift Switch)',
    stock: 45,
  },
  //  Clothing 
  {
    name: 'sweatshirt',
    price: 600,
    image: 'https://www.untouchedworld.com/cdn/shop/files/1744-CassumHalfZipSweater-Stone-CASSUM26-Juan-032.jpg?v=1773623015&width=740',
    category: 'clothing',
    description: 'Crafted from a considered blend of Merino, Possum, Cashmere and Silk, it delivers remarkable warmth without weight. Soft against the skin and naturally breathable, it invites all-day wear, whether layered beneath a coat on crisp mornings or worn alone as the air cools toward evening.',
    stock: 100,
  },
  {
    name: 'sweatpants',
    price: 940,
    image: 'https://media.brunellocucinelli.com/image/upload/f_auto,q_auto,dpr_auto/c_scale,w_1000/t_bc_sfcc_v_image/v1772092183/prod/seecommerce/original/261BW863E347-C9300-D.jpeg?_i=AG',
    category: 'clothing',
    description: 'These soft techno cotton French terry trousers are characterized by their pull-on fit with elasticized drawstring and straight lines to provide a child with the maximum ability to move.',
    stock: 150,
  },
  {
    name: 'running shoes',
    price: 280,
    image: 'https://m.media-amazon.com/images/I/51-nA96rEsL._AC_SY625_.jpg',
    category: 'clothing',
    description: 'Engineered knit upper: A lightweight, breathable knit material that reduces the need for additional overlays. FF BLAST PLUS cushioning: Midsole foam that provides a blend of cloud like cushioning and a responsive ride that is lighter than FF BLAST.',
    stock: 90,
  },
  //  Food 
  {
    name: ' Espresso Blend',
    price: 75,
    image: 'https://stali.com.au/cdn/shop/files/1KGORTH_c1e54069-b6f7-4b71-bab3-b317e122aee9.png?v=1752197507&width=713',
    category: 'food',
    description: 'With notes of chocolate, caramel butterscotch and apple, Orthodox is the kind of cup that feels like home. Familiar, reliable, and endlessly satisfying.',
    stock: 300,
  },
  {
    name: 'chocolate gift box',
    price: 190,
    image: 'https://seescandies.com.au/cdn/shop/files/assorted-chocolates-all-year-2lb-alt1_1.jpg?v=1774475996&width=1200',
    category: 'food',
    description: 'Inside every box (about 26 pieces), you will find an irresistible mix of classics like Milk Bordeaux, Dark Scotchmallow, Milk Almond Caramel, and Dark Butterchew, just to name a few.',
    stock: 120,
  },
  {
    name: 'Organic mixed nuts pack',
    price: 35,
    image: 'https://m.media-amazon.com/images/I/81LcBjzDhUL._AC_SX300_SY300_QL70_ML2_.jpg',
    category: 'food',
    description: 'Premium Mix of Almond, Cranberries, White Choc Gems, Pistachio Kernels a Healthy Energy Boosting Snack - 21 x 35g Bags',
    stock: 250,
  },
  //  Home 
  {
    name: 'table lamp',
    price: 385,
    image: 'https://www.designbythem.com/cdn/shop/files/DBT-Parcel--109125.jpg?v=1763595417&width=840',
    category: 'home',
    description: 'Room to room, the Parcel Portable Lamp provides a touch of brightness, warmth and character with its tidy, tactile form. Constructed from lightweight yet robust aluminium, the lamp features 3 diffused light settings, changeable with a gentle tap.',
    stock: 60,
  },
  {
    name: 'Scented candle set',
    price: 575,
    image: 'https://www.brandedcandles.com.au/cdn/shop/files/Custom_Candle_with_printed_jar_and_packaging_2.jpg?v=1732685424&width=1800',
    category: 'home',
    description: 'These candles measure 102mm high, 90mm wide and hold 350gm of wax/fragrance. This will deliver an exquisite 50 hour burn time.',
    stock: 80,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(` Seeded ${products.length} products`);
  await mongoose.disconnect();
}

seed().catch(console.error);
