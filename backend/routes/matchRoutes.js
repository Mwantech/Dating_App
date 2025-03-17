const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const protect = require("../middlewares/authMiddleware"); 

// Get matches for current user
router.get("/", protect, matchController.getMatches);

// Get recommended matches for current user
router.get("/recommendations", protect, matchController.getRecommendedMatches);

// Get filtered matches based on custom criteria
router.post("/filter", protect, matchController.getFilteredMatches);

module.exports = router;