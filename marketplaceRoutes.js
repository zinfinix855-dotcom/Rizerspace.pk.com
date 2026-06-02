const express = require("express");
const router = express.Router();
const {
  getListings,
  createListing,
  updateListingStatus
} = require("../controllers/marketplaceController");
const { protect } = require("../middleware/auth");

router.get("/listings", getListings);
router.post("/listings", protect, createListing);
router.put("/listings/:id/status", protect, updateListingStatus);

module.exports = router;
