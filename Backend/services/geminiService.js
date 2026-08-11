const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3.6-flash";

// =====================================================
// CLEAN JSON RESPONSE
// =====================================================

const cleanJsonResponse = (text) => {
  if (!text) {
    throw new Error("AI returned an empty response");
  }

  let cleaned = text.trim();

  // Remove markdown code fences if Gemini returns them
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Invalid JSON returned by Gemini:",
      cleaned
    );

    throw new Error(
      "AI returned an invalid response"
    );
  }
};

// =====================================================
// AI PROFILE ANALYSIS
// =====================================================

const analyzeProfile = async (profile) => {
  const prompt = `
You are an expert career advisor for software developers.

Analyze the following job seeker profile.

PROFILE

Name:
${profile.name || "Not provided"}

Skills:
${
  profile.skills?.length
    ? profile.skills.join(", ")
    : "Not provided"
}

Education:
${JSON.stringify(
  profile.education || []
)}

Experience:
${JSON.stringify(
  profile.experience || []
)}

Location:
${profile.location || "Not provided"}

Total Experience:
${
  profile.totalExperience ||
  "Not provided"
}

CTC:
${profile.ctc || "Not provided"}

Analyze this profile for software development jobs.

Return ONLY valid JSON.

Use exactly this structure:

{
  "score": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestions": [],
  "recommendedRoles": []
}

Rules:

- score must be a number between 0 and 100
- summary should be concise and practical
- strengths should contain realistic strengths
- weaknesses should contain realistic weaknesses
- missingSkills should contain useful skills the candidate can learn
- suggestions should be actionable
- recommendedRoles should contain suitable software development roles
- Return JSON only
- Do not return markdown
- Do not return explanations outside the JSON
`;

  const response =
    await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

  return cleanJsonResponse(
    response.text
  );
};

// =====================================================
// AI EXPERIENCE IMPROVER
// =====================================================

const improveExperience = async ({
  role,
  company,
  description,
  skills,
}) => {
  const prompt = `
You are an expert technical resume writer.

Improve the following job experience description
for a professional software developer resume.

Role:
${role || "Not provided"}

Company:
${company || "Not provided"}

Current Description:
${description || "Not provided"}

Candidate Skills:
${
  skills?.length
    ? skills.join(", ")
    : "Not provided"
}

Rewrite the description professionally.

Requirements:

- Use strong action verbs
- Make it suitable for a software developer resume
- Keep it truthful
- Do not invent fake achievements
- Do not invent numbers
- Keep it concise
- Focus on responsibilities, technologies and impact

Return ONLY valid JSON.

Use exactly this structure:

{
  "improvedDescription": ""
}

Return JSON only.
`;

  const response =
    await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

  return cleanJsonResponse(
    response.text
  );
};

// =====================================================
// AI JOB MATCH
// =====================================================

const analyzeJobMatch = async (
  profile,
  job
) => {
  const prompt = `
You are an expert recruitment AI.

Compare the candidate profile with the job requirements.

CANDIDATE PROFILE

Name:
${profile.name || "Not provided"}

Skills:
${
  profile.skills?.length
    ? profile.skills.join(", ")
    : "Not provided"
}

Education:
${JSON.stringify(
  profile.education || []
)}

Experience:
${JSON.stringify(
  profile.experience || []
)}

Total Experience:
${
  profile.totalExperience ||
  "Not provided"
}

Location:
${profile.location || "Not provided"}


JOB INFORMATION

Title:
${job.title || "Not provided"}

Company:
${job.company || "Not provided"}

Location:
${job.location || "Not provided"}

Required Skills:
${
  job.skillsRequired?.length
    ? job.skillsRequired.join(", ")
    : "Not provided"
}

Experience Required:
${job.experience || "Not provided"}

Employment Type:
${
  job.employmentType ||
  "Not provided"
}

Description:
${job.description || "Not provided"}

Responsibilities:
${JSON.stringify(
  job.responsibility || []
)}

Calculate how well the candidate matches this job.

Return ONLY valid JSON.

Use exactly this structure:

{
  "score": 0,
  "matchLevel": "",
  "matchedSkills": [],
  "missingSkills": [],
  "recommendation": ""
}

Rules:

- score must be between 0 and 100
- matchLevel must be one of:
  Excellent Match
  Strong Match
  Good Match
  Moderate Match
  Low Match
- matchedSkills should contain skills from the candidate that match the job
- missingSkills should contain useful required skills the candidate lacks
- recommendation should be practical and concise
- Return JSON only
`;

  const response =
    await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

  return cleanJsonResponse(
    response.text
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  analyzeProfile,
  improveExperience,
  analyzeJobMatch,
};