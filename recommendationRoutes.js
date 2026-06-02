const express = require("express");
const router = express.Router();
const { getCollaborativeRecommendations, getPersonalizedFeed } = require("../controllers/recommendationController");
const { protect } = require("../middleware/auth");

router.get("/for-you", protect, getPersonalizedFeed);
router.get("/:productId", getCollaborativeRecommendations);

module.exports = router;
