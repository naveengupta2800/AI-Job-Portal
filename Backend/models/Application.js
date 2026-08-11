const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    /* ================= JOB ================= */
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    /* ================= APPLICANT ================= */
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= CONTACT ================= */
    phone: {
      type: String,
      required: false,
    },

    /* ================= RESUME ================= */
    resume: {
      type: String,
      required: false,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview",
        "Rejected",
        "Hired",
      ],
      default: "Applied",
    },

    /* ================= STATUS TIMELINE ================= */
    timeline: [
      {
        status: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* ================= INTERVIEW ================= */
    interview: {
      date: {
        type: Date,
        required: false,
      },

      time: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);