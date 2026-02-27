const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.post("/login", loginUser);

// Admin only register
router.post("/register", registerUser);

module.exports = router;