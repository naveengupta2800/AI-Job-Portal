
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api.js";

function ScoreCircle({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div
      className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#6366f1 ${safeScore * 3.6}deg, #e2e8f0 ${safeScore * 3.6}deg)`,
      }}
    >
      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
        <span className="text-4xl font-bold tracking-tight text-slate-900">
          {safeScore}
        </span>
        <span className="text-xs font-medium text-slate-500">out of 100</span>
      </div>
    </div>
  );
}

function ResultList({ title, items, type = "default", emptyText }) {
  const styles = {
    positive: {
      icon: "✓",
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    negative: {
      icon: "!",
      iconClass: "bg-amber-100 text-amber-700",
    },
    skill: {
      icon: "+",
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    default: {
      icon: "→",
      iconClass: "bg-slate-100 text-slate-700",
    },
  };

  const style = styles[type] || styles.default;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      {items?.length ? (
        <ul className="mt-5 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${String(item)}-${index}`}
              className="flex items-start gap-3"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${style.iconClass}`}
              >
                {style.icon}
              </span>
              <p className="break-words pt-1 text-sm leading-6 text-slate-600">
                {String(item)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          {emptyText || "No items returned for this section."}
        </p>
      )}
    </section>
  );
}

export default function AIProfileAnalysisPage() {
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProfile() {
    setLoadingProfile(true);
    setError("");

    try {
      const { data } = await api.get("/api/profile/jobseeker");
      const p = data?.profile;

      if (!p) {
        throw new Error("Profile information was not returned by the server.");
      }

      setProfile({
        name: p.name || "",
        email: p.email || "",
        skills: Array.isArray(p.skills) ? p.skills : [],
        education: Array.isArray(p.education) ? p.education : [],
        experience: Array.isArray(p.experience) ? p.experience : [],
        location: p.address || "",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your profile."));
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function analyzeProfile() {
    if (!profile) {
      setError("Please load your profile before starting the analysis.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setNotice("");
    setAnalysis(null);

    try {
      const { data } = await api.post("/api/ai/profile-analysis", profile);

      if (!data?.analysis) {
        throw new Error("The AI did not return an analysis. Please try again.");
      }

      setAnalysis(data.analysis);
      setNotice("Your profile analysis is ready.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "AI analysis failed. Check your backend and Gemini API configuration."
        )
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const skills = profile?.skills || [];
  const education = profile?.education || [];
  const experience = profile?.experience || [];

  const score = Number(analysis?.score);
  const scoreLabel =
    score >= 80
      ? "Strong profile"
      : score >= 60
        ? "Good foundation"
        : score >= 40
          ? "Room to improve"
          : "Needs attention";

  const scoreDescription =
    score >= 80
      ? "Your profile shows promising strengths. Focus on refining the details and demonstrating your impact."
      : score >= 60
        ? "You have a useful foundation. A few targeted improvements could make your profile more compelling."
        : score >= 40
          ? "Strengthen your skills, project evidence and experience descriptions to improve your profile."
          : "Start with the fundamentals: add relevant skills, complete your education and showcase your projects or experience.";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-12 -top-16 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-200">
            <span>✦</span>
            AI CAREER INTELLIGENCE
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Understand your profile.
            <br className="hidden sm:block" /> Improve your next move.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Get AI-generated feedback on your strengths, missing skills and
            suitable software development roles based on your profile.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={analyzeProfile}
              disabled={!profile || analyzing || loadingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Analyzing profile...
                </>
              ) : (
                <>✦ Analyze my profile</>
              )}
            </button>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Update my profile →
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="font-bold"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Technical skills",
            value: skills.length,
            icon: "⌘",
            description: "Skills in your profile",
          },
          {
            label: "Education records",
            value: education.length,
            icon: "▤",
            description: "Qualifications listed",
          },
          {
            label: "Experience records",
            value: experience.length,
            icon: "◷",
            description: "Work or project entries",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {loadingProfile ? "—" : item.value}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-700">
                {item.icon}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Profile snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              These are the details currently sent for analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProfile}
            disabled={loadingProfile || analyzing}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loadingProfile ? "Loading..." : "Refresh profile"}
          </button>
        </div>

        {loadingProfile ? (
          <div className="mt-6 animate-pulse space-y-3">
            <div className="h-5 w-1/3 rounded bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
          </div>
        ) : profile ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Candidate
              </p>
              <p className="mt-2 break-words font-semibold text-slate-900">
                {profile.name || "Name not provided"}
              </p>
              <p className="mt-1 break-all text-sm text-slate-500">
                {profile.email || "Email not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Location
              </p>
              <p className="mt-2 break-words font-semibold text-slate-900">
                {profile.location || "Not provided"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Your skills
              </p>

              {skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No skills added. Add your skills to your profile before
                  analyzing it.
                </p>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Education
              </p>
              <div className="space-y-2">
                {education.length ? (
                  education.map((item, index) => (
                    <div
                      key={`education-${index}`}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {item.degree || "Degree not specified"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.school || "Institution not specified"}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No education records yet.
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Experience
              </p>
              <div className="space-y-2">
                {experience.length ? (
                  experience.map((item, index) => (
                    <div
                      key={`experience-${index}`}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title || "Role not specified"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.company || "Organization not specified"}
                        {item.years ? ` · ${item.years}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No experience records yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Load your profile to continue.
          </p>
        )}
      </section>

      {analysis && (
        <>
          <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
            <div className="grid grid-cols-1 gap-7 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 sm:p-8 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
              <div className="flex justify-center">
                <ScoreCircle score={analysis.score} />
              </div>

              <div>
                <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  AI PROFILE SCORE
                </span>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {scoreLabel}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  {analysis.summary || scoreDescription}
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  This is an AI-generated assessment of the information
                  provided, not a hiring guarantee or an objective measure of
                  your employability.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ResultList
              title="Your strengths"
              items={analysis.strengths}
              type="positive"
              emptyText="No specific strengths were returned. Add more details to your profile and analyze again."
            />

            <ResultList
              title="Areas to improve"
              items={analysis.weaknesses}
              type="negative"
              emptyText="No weaknesses were returned."
            />

            <ResultList
              title="Skills to consider learning"
              items={analysis.missingSkills}
              type="skill"
              emptyText="No additional skills were suggested."
            />

            <ResultList
              title="Recommended next steps"
              items={analysis.suggestions}
              type="default"
              emptyText="No suggestions were returned."
            />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
                🎯
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recommended career roles
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Roles the AI considers relevant to your current profile.
                </p>
              </div>
            </div>

            {analysis.recommendedRoles?.length ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {analysis.recommendedRoles.map((role, index) => (
                  <div
                    key={`${role}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-sm font-bold text-violet-700">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm font-semibold text-slate-800">
                      {role}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No recommended roles were returned.
              </p>
            )}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={analyzeProfile}
              disabled={analyzing || loadingProfile}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Run analysis again"}
            </button>

            <Link
              to="/ai/job-match"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explore AI job matching →
            </Link>
          </div>
        </>
      )}

      {!analysis && !loadingProfile && (
        <section className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            ✦
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Ready to analyze your profile?
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            The AI will review the details above and return a score, strengths,
            improvement areas, missing skills and suitable career roles.
          </p>

          <button
            type="button"
            onClick={analyzeProfile}
            disabled={!profile || analyzing}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Generate my analysis"}
          </button>
        </section>
      )}
    </div>
  );
}
