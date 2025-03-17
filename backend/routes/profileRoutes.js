const express = require("express");
const { 
    createOrUpdateProfile, 
    getMyProfile, 
    getProfileById, 
    discoverProfiles, 
    deleteProfile 
} = require("../controllers/profileController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

// All profile routes are protected and require authentication
router.use(protect);

// Create or update profile
router.post("/", createOrUpdateProfile);

// Get current user's profile
router.get("/me", getMyProfile);

// Get profile by ID
router.get("/:id", getProfileById);

// Discover profiles (with filters)
router.get("/", discoverProfiles);

// Delete profile
router.delete("/", deleteProfile);

module.exports = router;