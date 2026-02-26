const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: String,

    category: {
      type: String,
      enum: ["orphanage", "water", "street_feeding", "education", "eid_event"],
      required: true
    },

    location: String,

    budget: {
      type: Number,
      default: 0
    },

    budgetUsed: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["planning", "ongoing", "completed"],
      default: "planning"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    images: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);