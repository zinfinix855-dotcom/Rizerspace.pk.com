const express = require("express");
const router = express.Router();
const { getMyTrackers, upsertTracker, removeTracker, getDemandLeaderboard } = require("../controllers/grailTrackerController");
const { protect, admin } = require("../middleware/auth");

router.get("/", protect, getMyTrackers);
router.post("/", protect, upsertTracker);
router.delete("/:id", protect, removeTracker);

// Admin demand intelligence
router.get("/demand", protect, getDemandLeaderboard);

module.exports = router;
