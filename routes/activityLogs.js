const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");
const { protect } = require("../middleware/authMiddleware");

// Admin & Finance can view logs
router.get("/", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "finance") {
    return res.status(403).json({ message: "Access denied" });
  }

  const logs = await ActivityLog.find()
    .populate("user", "name role")
    .sort({ createdAt: -1 });

  res.json(logs);
});

module.exports = router;