const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String
    },
    image: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", DonationSchema);