
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["Professional", "Enterprise"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
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
      enum: ["Created","Pending", "Paid", "Failed"],
      default: "Created",
    },

    jobLimit: {
      type: Number,
      required: true,
      min: -1,
    },

    validityDays: {
      type: Number,
      required: true,
      min: 1,
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

// Helpful for recruiter payment history
paymentSchema.index({
  recruiter: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Payment", paymentSchema);
