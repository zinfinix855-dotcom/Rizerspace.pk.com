require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Collection = require("../models/Collection");
const Listing = require("../models/Listing");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rizerspace");
  console.log("📡 MongoDB Connected for seeding...");
};

// Seed figures with multi-dimensional collector stats
const products = [
  {
    title: "Goku Ultra Instinct",
    description: "Premium 1/6 scale masterpiece of Goku in his Ultra Instinct form. Features 30+ articulation points, energy effect parts, and interchangeable hands.",
    category: "Dragon Ball Z",
    price: 89.99, discountedPrice: 74.99, stock: 25,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"],
    specs: { Scale: "1/6", Height: "30cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#FF6B35,#FF9F1C)", symbol: "孫", averageRating: 4.9, numReviews: 128,
    rarity: "Super Rare",
    limitedEdition: { isLimited: true, totalRun: 1000, releasedUnits: 750 },
    marketValueHistory: [
      { price: 68.00, date: new Date("2025-06-01") },
      { price: 72.50, date: new Date("2025-09-01") },
      { price: 80.00, date: new Date("2025-12-01") },
      { price: 89.99, date: new Date("2026-03-01") }
    ]
  },
  {
    title: "Naruto Uzumaki — Sage Mode",
    description: "Naruto in his iconic Sage Mode stance. Includes Rasengan effect part and display base with Hidden Leaf Village crest.",
    category: "Naruto", price: 79.99, stock: 18,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
    specs: { Scale: "1/7", Height: "27cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#F7971E,#FFD200)", symbol: "鳴", averageRating: 4.8, numReviews: 94,
    rarity: "Rare",
    limitedEdition: { isLimited: false },
    marketValueHistory: [
      { price: 70.00, date: new Date("2025-06-01") },
      { price: 74.00, date: new Date("2025-10-01") },
      { price: 79.99, date: new Date("2026-02-01") }
    ]
  },
  {
    title: "Monkey D. Luffy — Gear 5",
    description: "Luffy in his legendary Gear 5 transformation. Joyboy's power in a stunning 1/6 scale figure with cloud effect accessories and alternate heads.",
    category: "One Piece", price: 94.99, stock: 12,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
    specs: { Scale: "1/6", Height: "32cm", Material: "ABS+PVC+Resin" },
    gradient: "linear-gradient(135deg,#FF0844,#FFB199)", symbol: "路", averageRating: 5.0, numReviews: 212,
    rarity: "Grail",
    limitedEdition: { isLimited: true, totalRun: 500, releasedUnits: 450 },
    marketValueHistory: [
      { price: 85.00, date: new Date("2025-06-01") },
      { price: 92.00, date: new Date("2025-10-01") },
      { price: 110.00, date: new Date("2026-01-01") },
      { price: 135.00, date: new Date("2026-05-01") }
    ]
  },
  {
    title: "Tanjiro Kamado",
    description: "Tanjiro wielding his Nichirin blade. Features stunning translucent water breathing effect parts with deep blue gradient.",
    category: "Demon Slayer", price: 84.99, discountedPrice: 69.99, stock: 30,
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"],
    specs: { Scale: "1/7", Height: "26cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#1CB5E0,#000046)", symbol: "炭", averageRating: 4.7, numReviews: 76,
    rarity: "Common",
    limitedEdition: { isLimited: false },
    marketValueHistory: [
      { price: 84.99, date: new Date("2025-06-01") }
    ]
  },
  {
    title: "Levi Ackerman",
    description: "Humanity's Strongest Soldier in full ODM gear. Includes multiple blade accessories and a dynamic flying pose display stand.",
    category: "Attack on Titan", price: 92.99, stock: 8,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"],
    specs: { Scale: "1/6", Height: "24cm", Material: "ABS+PVC+Metal" },
    gradient: "linear-gradient(135deg,#373B44,#4286F4)", symbol: "兵", averageRating: 4.9, numReviews: 155,
    rarity: "Super Rare",
    limitedEdition: { isLimited: true, totalRun: 800, releasedUnits: 600 },
    marketValueHistory: [
      { price: 85.00, date: new Date("2025-08-01") },
      { price: 92.99, date: new Date("2026-02-01") }
    ]
  },
  {
    title: "Satoru Gojo",
    description: "The strongest sorcerer in his blindfold-off stance. Limitless cursed technique energy effects included. Collector's limited edition.",
    category: "Jujutsu Kaisen", price: 88.99, stock: 0,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
    specs: { Scale: "1/6", Height: "31cm", Material: "ABS+PVC+Resin" },
    gradient: "linear-gradient(135deg,#667eea,#764ba2)", symbol: "五", averageRating: 5.0, numReviews: 189,
    rarity: "Grail",
    limitedEdition: { isLimited: true, totalRun: 300, releasedUnits: 300 },
    marketValueHistory: [
      { price: 88.99, date: new Date("2025-06-01") },
      { price: 120.00, date: new Date("2025-11-01") },
      { price: 150.00, date: new Date("2026-04-01") }
    ]
  },
  {
    title: "All Might — Silver Age",
    description: "The Symbol of Peace in his prime. All Might's iconic Plus Ultra pose with Golden Age hero suit. Limited collector's edition.",
    category: "My Hero Academia", price: 76.99, discountedPrice: 64.99, stock: 20,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
    specs: { Scale: "1/7", Height: "35cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#1FA2FF,#12D8FA,#A6FFCB)", symbol: "勝", averageRating: 4.6, numReviews: 63,
    rarity: "Common",
    limitedEdition: { isLimited: false },
    marketValueHistory: [
      { price: 76.99, date: new Date("2025-06-01") }
    ]
  },
  {
    title: "Itachi Uchiha",
    description: "Itachi with Sharingan activated. Akatsuki cloak, kunai accessories, and Susanoo rib cage display effect. A must-have.",
    category: "Naruto", price: 91.99, stock: 14,
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"],
    specs: { Scale: "1/6", Height: "29cm", Material: "ABS+PVC+Resin" },
    gradient: "linear-gradient(135deg,#0F0C29,#302B63,#24243e)", symbol: "鼬", averageRating: 4.9, numReviews: 201,
    rarity: "Super Rare",
    limitedEdition: { isLimited: true, totalRun: 1200, releasedUnits: 1000 },
    marketValueHistory: [
      { price: 80.00, date: new Date("2025-06-01") },
      { price: 88.00, date: new Date("2025-12-01") },
      { price: 91.99, date: new Date("2026-04-01") }
    ]
  },
  {
    title: "Ichigo Kurosaki — Bankai",
    description: "Ichigo in his final Bankai form. Includes Zangetsu, spiritual pressure effect parts, and a hollow mask accessory.",
    category: "Bleach", price: 86.99, stock: 16,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600"],
    specs: { Scale: "1/6", Height: "31cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#232526,#414345)", symbol: "一", averageRating: 4.8, numReviews: 112,
    rarity: "Rare",
    limitedEdition: { isLimited: false },
    marketValueHistory: [
      { price: 86.99, date: new Date("2025-06-01") }
    ]
  },
  {
    title: "Saitama — Serious Punch",
    description: "Saitama mid Serious Punch. Shockwave effect base included. Beautifully sculpted expression of pure, effortless power.",
    category: "One Punch Man", price: 74.99, discountedPrice: 59.99, stock: 22,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
    specs: { Scale: "1/7", Height: "28cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#F7971E,#FFD200)", symbol: "埼", averageRating: 4.7, numReviews: 88,
    rarity: "Common",
    limitedEdition: { isLimited: false },
    marketValueHistory: [
      { price: 74.99, date: new Date("2025-06-01") }
    ]
  },
  {
    title: "Zoro — Three Sword Style",
    description: "Roronoa Zoro in his iconic three-sword style stance. Hell's memory pose with translucent green effect parts.",
    category: "One Piece", price: 97.99, stock: 10,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
    specs: { Scale: "1/6", Height: "29cm", Material: "ABS+PVC+Metal" },
    gradient: "linear-gradient(135deg,#00B09B,#96C93D)", symbol: "剣", averageRating: 4.9, numReviews: 167,
    rarity: "Super Rare",
    limitedEdition: { isLimited: true, totalRun: 1500, releasedUnits: 1200 },
    marketValueHistory: [
      { price: 90.00, date: new Date("2025-07-01") },
      { price: 97.99, date: new Date("2026-02-01") }
    ]
  },
  {
    title: "Mikasa Ackerman",
    description: "Mikasa in combat stance with ODM gear. Features multiple blade accessories and flowing scarf detail.",
    category: "Attack on Titan", price: 82.99, stock: 11,
    images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"],
    specs: { Scale: "1/7", Height: "25cm", Material: "ABS+PVC" },
    gradient: "linear-gradient(135deg,#4b6cb7,#182848)", symbol: "三", averageRating: 4.8, numReviews: 93,
    rarity: "Rare",
    limitedEdition: { isLimited: false },
    marketValueHistory: [
      { price: 82.99, date: new Date("2025-06-01") }
    ]
  }
];

const coupons = [
  { code: "RIZERSPACE10", discount: 10, expiryDate: new Date("2027-12-31") },
  { code: "ANIME20", discount: 20, expiryDate: new Date("2027-06-30") },
  { code: "NEWUSER15", discount: 15, expiryDate: new Date("2027-12-31") }
];

const seedDB = async (skipConnect = false) => {
  try {
    if (!skipConnect) {
      await connectDB();
    }

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await Collection.deleteMany({});
    await Listing.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Insert Products
    const seededProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Create Admin User
    // Note: UserSchema pre-save hook handles hashing! Let's pass plain text to avoid double-hashing!
    const adminUser = await User.create({
      name: "RizerSpace Admin",
      email: "admin@rizerspace.com",
      password: "Admin@1337",
      role: "admin",
      isVerified: true
    });
    console.log("✅ Admin user created: admin@rizerspace.com / Admin@1337");

    // Create Sample Customer
    const customerUser = await User.create({
      name: "Naruto Uzumaki",
      email: "naruto@konoha.jp",
      password: "Hokage@9",
      role: "customer",
      isVerified: true,
      collectorLevel: 4,
      collectorXP: 380,
      loyaltyPoints: 120,
      referralCode: "HOKAGE99",
      badges: [
        { name: "First Step", icon: "🌱", unlockedAt: new Date("2025-06-10") },
        { name: "Grail Hunter", icon: "🏆", unlockedAt: new Date("2026-01-15") },
        { name: "Set Collector", icon: "📚", unlockedAt: new Date("2026-03-20") }
      ]
    });
    console.log("✅ Sample customer created: naruto@konoha.jp / Hokage@9");

    // Pre-seed sample user Showcase Cabinet (Collection shelf)
    const luffyProduct = seededProducts.find(p => p.title.includes("Luffy"));
    const gojoProduct = seededProducts.find(p => p.title.includes("Gojo"));
    const zoroProduct = seededProducts.find(p => p.title.includes("Zoro"));

    await Collection.create({
      user: customerUser._id,
      items: [
        {
          product: luffyProduct._id,
          acquisitionPrice: 94.99,
          serialNumber: "022 / 500",
          condition: "MISB",
          addedAt: new Date("2025-10-15")
        },
        {
          product: gojoProduct._id,
          acquisitionPrice: 110.00,
          serialNumber: "115 / 300",
          condition: "MIB",
          addedAt: new Date("2026-01-20")
        },
        {
          product: zoroProduct._id,
          acquisitionPrice: 97.99,
          serialNumber: "847 / 1500",
          condition: "MISB",
          addedAt: new Date("2026-03-22")
        }
      ]
    });
    console.log("🏆 Pre-seeded collection showcase shelf for Naruto");

    // Pre-seed a few resale Marketplace Listings
    await Listing.create({
      seller: customerUser._id,
      product: gojoProduct._id,
      price: 145.00,
      condition: "MIB",
      description: "MISB original box opened only to inspect condition. Figure is flawless and in mint condition! Rare collectable Grail.",
      images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"],
      status: "Active"
    });
    
    await Listing.create({
      seller: customerUser._id,
      product: luffyProduct._id,
      price: 125.00,
      condition: "MISB",
      description: "Brand new unopened Luffy Gear 5. Kept in smoke-free/pet-free environment.",
      images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600"],
      status: "Active"
    });
    console.log("🤝 Pre-seeded resale marketplace listings");

    // Insert Coupons
    await Coupon.insertMany(coupons);
    console.log(`✅ Seeded ${coupons.length} coupons`);

    console.log("\n🎌 Database seeding complete! RizerSpace is ready.\n");
  } catch (error) {
    console.error("🚨 Seeding Error:", error);
    if (!skipConnect) {
      process.exit(1);
    }
  }
};

module.exports = { seedDB, products, coupons };

if (require.main === module) {
  (async () => {
    await seedDB(false);
    process.exit(0);
  })();
}
