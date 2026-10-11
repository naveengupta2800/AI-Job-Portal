const express = require("express");

const router = express.Router();

const {
  analyzeJobseekerProfile,
  improveJobseekerExperience,
  analyzeJobMatchController,
  careerChatController,
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

router.post( "/job-match",
  analyzeJobMatchController
);

router.post("/career-chat", careerChatController);
module.exports = router;