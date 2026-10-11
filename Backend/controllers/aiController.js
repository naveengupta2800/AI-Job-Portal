const {
  analyzeProfile,
  improveExperience,
  analyzeJobMatch,
  careerChat,
} = require("../services/geminiService");

// =====================================================
// AI PROFILE ANALYSIS
// =====================================================

const analyzeJobseekerProfile = async (
  req,
  res
) => {
  try {
    const profile = req.body;

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Profile data is required",
      });
    }

    const result =
      await analyzeProfile(profile);

    return res.status(200).json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error(
      "AI Profile Analysis Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "AI profile analysis failed",
    });
  }
};

// =====================================================
// AI EXPERIENCE IMPROVEMENT
// =====================================================

const improveJobseekerExperience =
  async (req, res) => {
    try {
      const {
        role,
        company,
        description,
        skills,
      } = req.body;

      if (!description?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Experience description is required",
        });
      }

      const result =
        await improveExperience({
          role,
          company,
          description,
          skills,
        });

      return res.status(200).json({
        success: true,
        improvedDescription:
          result.improvedDescription,
      });
    } catch (error) {
      console.error(
        "AI Experience Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "AI experience improvement failed",
      });
    }
  };

// =====================================================
// AI JOB MATCH
// =====================================================

const analyzeJobMatchController =
  async (req, res) => {
    try {
      const {
        profile,
        job,
      } = req.body;

      if (!profile) {
        return res.status(400).json({
          success: false,
          message:
            "Candidate profile is required",
        });
      }

      if (!job) {
        return res.status(400).json({
          success: false,
          message:
            "Job information is required",
        });
      }

      const result =
        await analyzeJobMatch(
          profile,
          job
        );

      return res.status(200).json({
        success: true,
        match: result,
      });
    } catch (error) {
      console.error(
        "AI Job Match Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "AI job matching failed",
      });
    }
  };

  // =====================================================
// AI CAREER ASSISTANT
// =====================================================

const careerChatController = async (req, res) => {
  try {
    const { message, history = [], profile = {} } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must not exceed 2000 characters.",
      });
    }

    const reply = await careerChat({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      profile:
        profile && typeof profile === "object" && !Array.isArray(profile)
          ? profile
          : {},
    });

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI Career Assistant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Career assistant is temporarily unavailable. Please try again.",
    });
  }
};
// =====================================================
// EXPORT
// =====================================================

module.exports = {
  analyzeJobseekerProfile,
  improveJobseekerExperience,
  analyzeJobMatchController,
  careerChatController,
};