const express = require("express");
const router = express.Router();
const {
  getShowcase,
  getPublicProfile,
  addToCollection,
  removeFromCollection
} = require("../controllers/collectorController");
const { protect } = require("../middleware/auth");

// Public profile by referralCode slug (e.g. GET /api/collector/profile/HOKAGE99)
router.get("/profile/:username", getPublicProfile);

// Public (with token-checking for private shelves) or specific user showcase cabinet
router.get("/showcase/:userId", getShowcase);

// Protected collection modifications
router.post("/collection/add", protect, addToCollection);
router.delete("/collection/:itemId", protect, removeFromCollection);

module.exports = router;

