// index.js
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(cors());
app.use(express.json());

// -------------------------
// Routes
// -------------------------
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const donationRoutes = require("./routes/donations");
const financeRoutes = require("./routes/finance"); // ✅ NEW (Finance)
const activityRoutes = require("./routes/activityLogs");

app.use("/api/activity", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/finance", financeRoutes); // ✅ NEW (Finance route added)

// -------------------------
// MongoDB Connection
// -------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// -------------------------
// Test Routes
// -------------------------
app.get("/", (req, res) => {
  res.send("NGO Backend Running ✅");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working! 🚀" });
});

// -------------------------
// Server listener
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});