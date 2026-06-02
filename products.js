const express = require("express");
const router = express.Router();

// ── In-memory product catalogue (swap with a DB later) ──────────────────────
const PRODUCTS = [
  { id:1, name:"Goku Ultra Instinct", series:"Dragon Ball Z", price:89.99, originalPrice:119.99, badge:"SALE", rating:4.9, reviews:128, inStock:true, description:"Premium 1/6 scale masterpiece of Goku in his Ultra Instinct form. Features 30+ articulation points, energy effect parts, and interchangeable hands.", specs:{Scale:"1/6",Height:"30cm",Material:"ABS+PVC"}, gradient:"linear-gradient(135deg,#FF6B35,#FF9F1C)", symbol:"孫", category:"Dragon Ball Z" },
  { id:2, name:"Naruto Uzumaki — Sage Mode", series:"Naruto Shippuden", price:79.99, originalPrice:null, badge:"NEW", rating:4.8, reviews:94, inStock:true, description:"Naruto Uzumaki in his iconic Sage Mode stance. Includes Rasengan effect part and display base with Hidden Leaf Village crest.", specs:{Scale:"1/7",Height:"27cm",Material:"ABS+PVC"}, gradient:"linear-gradient(135deg,#F7971E,#FFD200)", symbol:"鳴", category:"Naruto" },
  { id:3, name:"Monkey D. Luffy — Gear 5", series:"One Piece", price:94.99, originalPrice:null, badge:"HOT", rating:5.0, reviews:212, inStock:true, description:"Luffy in his legendary Gear 5 transformation. Joyboy's power in a stunning 1/6 scale figure with cloud effect accessories and alternate heads.", specs:{Scale:"1/6",Height:"32cm",Material:"ABS+PVC+Resin"}, gradient:"linear-gradient(135deg,#FF0844,#FFB199)", symbol:"路", category:"One Piece" },
  { id:4, name:"Tanjiro Kamado", series:"Demon Slayer", price:84.99, originalPrice:99.99, badge:"SALE", rating:4.7, reviews:76, inStock:true, description:"Tanjiro Kamado wielding his Nichirin blade. Features stunning translucent water breathing effect parts with deep blue gradient.", specs:{Scale:"1/7",Height:"26cm",Material:"ABS+PVC"}, gradient:"linear-gradient(135deg,#1CB5E0,#000046)", symbol:"炭", category:"Demon Slayer" },
  { id:5, name:"Levi Ackerman", series:"Attack on Titan", price:92.99, originalPrice:null, badge:null, rating:4.9, reviews:155, inStock:true, description:"Humanity's Strongest Soldier in full ODM gear. Includes multiple blade accessories and a dynamic flying pose display stand.", specs:{Scale:"1/6",Height:"24cm",Material:"ABS+PVC+Metal"}, gradient:"linear-gradient(135deg,#373B44,#4286F4)", symbol:"兵", category:"Attack on Titan" },
  { id:6, name:"Satoru Gojo", series:"Jujutsu Kaisen", price:88.99, originalPrice:null, badge:"NEW", rating:5.0, reviews:189, inStock:false, description:"The strongest sorcerer in his blindfold-off stance. Limitless cursed technique energy effects included. Collector's limited edition.", specs:{Scale:"1/6",Height:"31cm",Material:"ABS+PVC+Resin"}, gradient:"linear-gradient(135deg,#667eea,#764ba2)", symbol:"五", category:"Jujutsu Kaisen" },
  { id:7, name:"All Might — Silver Age", series:"My Hero Academia", price:76.99, originalPrice:89.99, badge:"SALE", rating:4.6, reviews:63, inStock:true, description:"The Symbol of Peace in his prime. All Might's iconic Plus Ultra pose with Golden Age hero suit. Limited collector's edition.", specs:{Scale:"1/7",Height:"35cm",Material:"ABS+PVC"}, gradient:"linear-gradient(135deg,#1FA2FF,#12D8FA,#A6FFCB)", symbol:"勝", category:"My Hero Academia" },
  { id:8, name:"Itachi Uchiha", series:"Naruto Shippuden", price:91.99, originalPrice:null, badge:null, rating:4.9, reviews:201, inStock:true, description:"Itachi with Sharingan activated. Akatsuki cloak, kunai accessories, and Susanoo rib cage display effect. A must-have.", specs:{Scale:"1/6",Height:"29cm",Material:"ABS+PVC+Resin"}, gradient:"linear-gradient(135deg,#0F0C29,#302B63,#24243e)", symbol:"鼬", category:"Naruto" },
  { id:9, name:"Ichigo Kurosaki — Bankai", series:"Bleach", price:86.99, originalPrice:null, badge:"NEW", rating:4.8, reviews:112, inStock:true, description:"Ichigo in his final Bankai form. Includes Zangetsu, spiritual pressure effect parts, and a hollow mask accessory.", specs:{Scale:"1/6",Height:"31cm",Material:"ABS+PVC"}, gradient:"linear-gradient(135deg,#232526,#414345)", symbol:"一", category:"Bleach" },
  { id:10, name:"Saitama — Serious Punch", series:"One Punch Man", price:74.99, originalPrice:79.99, badge:"SALE", rating:4.7, reviews:88, inStock:true, description:"Saitama mid Serious Punch. Shockwave effect base included. Beautifully sculpted expression of pure, effortless power.", specs:{Scale:"1/7",Height:"28cm",Material:"ABS+PVC"}, gradient:"linear-gradient(135deg,#F7971E,#FFD200)", symbol:"埼", category:"One Punch Man" },
];

// GET /api/products — list all, optional ?category=X filter
router.get("/", (req, res) => {
  const { category } = req.query;
  const results = category
    ? PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : PRODUCTS;
  res.json({ data: results, total: results.length });
});

// GET /api/products/:id — single product
router.get("/:id", (req, res) => {
  const product = PRODUCTS.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ data: product });
});

module.exports = router;
