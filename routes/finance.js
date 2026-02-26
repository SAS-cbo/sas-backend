const express = require("express");
const router = express.Router();
const Finance = require("../models/Finance");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const { protect } = require("../middleware/authMiddleware");

// Role check
const financeOnly = (req, res, next) => {
  if (req.user && (req.user.role === "finance" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Finance department access only" });
  }
};

/* ================= CREATE ================= */
router.post("/", protect, financeOnly, async (req, res) => {
  try {
    const finance = new Finance({
      ...req.body,
      recordedBy: req.user._id
    });

    const saved = await finance.save();

    await ActivityLog.create({
      user: req.user._id,
      action: "Created finance record",
      module: "finance",
      details: `${saved.title} - ${saved.amount}`
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", protect, financeOnly, async (req, res) => {
  try {
    const updated = await Finance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });

    await ActivityLog.create({
      user: req.user._id,
      action: "Updated finance record",
      module: "finance",
      details: `${updated.title} - ${updated.amount}`
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", protect, financeOnly, async (req, res) => {
  try {
    const record = await Finance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    await record.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: "Deleted finance record",
      module: "finance",
      details: `${record.title} - ${record.amount}`
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ALL ================= */
router.get("/", protect, financeOnly, async (req, res) => {
  const records = await Finance.find().sort({ createdAt: -1 });
  res.json(records);
});

/* ================= MONTHLY SUMMARY ================= */
router.get("/monthly-summary", protect, financeOnly, async (req, res) => {
  try {
    const summary = await Finance.aggregate([
      {
        $match: { status: { $in: ["approved", "pending"] } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error generating summary" });
  }
});

module.exports = router;