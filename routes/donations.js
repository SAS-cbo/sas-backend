const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Finance = require("../models/Finance");
const ActivityLog = require("../models/ActivityLog");
const { protect } = require("../middleware/authMiddleware");

const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================
   GET ALL DONATIONS
========================= */
router.get("/", protect, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   CREATE DONATION
========================= */
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { donorName, amount, description } = req.body;

    let imageUrl = "";

    if (req.file) {
      const uploadFromBuffer = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await uploadFromBuffer();
      imageUrl = result.secure_url;
    }

    const newDonation = await Donation.create({
      donorName,
      amount,
      description,
      image: imageUrl
    });

    // Auto create finance income
    await Finance.create({
      type: "income",
      title: `Donation from ${donorName}`,
      amount,
      category: "donation",
      description,
      status: "approved",
      recordedBy: req.user._id
    });

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: "Created donation",
      module: "donation",
      details: `${donorName} - ${amount}`
    });

    res.status(201).json(newDonation);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   DELETE DONATION
========================= */
router.delete("/:id", protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    await donation.deleteOne();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: "Deleted donation",
      module: "donation",
      details: `${donation.donorName} - ${donation.amount}`
    });

    res.json({ message: "Donation deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;