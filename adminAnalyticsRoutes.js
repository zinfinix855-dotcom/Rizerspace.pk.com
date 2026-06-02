const express = require("express");
const router = express.Router();
const { getInventoryIntelligence, getDemandIntelligence } = require("../controllers/adminAnalyticsController");
const { protect, admin } = require("../middleware/auth");

router.get("/inventory", protect, admin, getInventoryIntelligence);
router.get("/demand", protect, admin, getDemandIntelligence);

module.exports = router;
