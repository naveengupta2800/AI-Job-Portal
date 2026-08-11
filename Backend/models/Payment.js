const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: String,
      enum: ["Starter", "Professional", "Business"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Created", "Paid", "Failed"],
      default: "Created",
    },

    jobLimit: {
      type: Number,
      required: true,
    },

    validityDays: {
      type: Number,
      required: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);