const express = require("express");
const { registerUser, loginUser } = require("../controllers/UserController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Example: Protected Route
router.get("/profile", protect, (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});

module.exports = router;
