const express = require("express");

const router = express.Router();

const {
  analyzeJobseekerProfile,
  improveJobseekerExperience,
  analyzeJobMatchController,
} = require("../controllers/aiController");

// =====================================================
// PROFILE AI
// =====================================================

router.post(
  "/profile-analysis",
  analyzeJobseekerProfile
);

// =====================================================
// EXPERIENCE AI
// =====================================================

router.post(
  "/improve-experience",
  improveJobseekerExperience
);

// =====================================================
// JOB MATCH AI
// =====================================================

router.post(
  "/job-match",
  analyzeJobMatchController
);

module.exports = router;