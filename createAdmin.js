// createAdmin.js
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sasDB";

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create the admin
    const admin = new User({
      name: "NGO Admin",
      email: "admin@sas.org",
      password: "SAS_admin01", // your admin password
      role: "admin",
    });

    await admin.save(); // triggers pre-save hook safely
    console.log("✅ Admin user created successfully:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();