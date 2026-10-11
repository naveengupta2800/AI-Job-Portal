import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";

const getId = (item) => item?._id || item?.id || "";

const getSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => (typeof skill === "string" ? skill : skill?.name || ""))
    .filter(Boolean);
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "JD";

function ScoreCircle({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-slate-100"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-violet-600 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
          {safeScore}%
        </span>
        <span className="text-xs font-medium text-slate-500">Match score</span>
      </div>
    </div>
  );
}

function SkillTag({ children, type = "matched" }) {
  const styles =
    type === "missing"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${styles}`}
    >
      <span>{type === "missing" ? "+" : "✓"}</span>
      {children}
    </span>
  );
}

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-700">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AIJobMatchingPage() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [matchResult, setMatchResult] = useState(null);

  const [loadingPage, setLoadingPage] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoadingPage(true);
      setError("");

      try {
        const [profileResponse, jobsResponse] = await Promise.all([
          api.get("/api/profile/jobseeker"),
          api.get("/api/jobs/all"),
        ]);

        if (!active) return;

        const profileData = profileResponse.data?.profile || null;
        const jobsData = jobsResponse.data;
        const jobsList = Array.isArray(jobsData)
          ? jobsData
          : jobsData?.jobs || jobsData?.data || [];

        setProfile(profileData);
        setJobs(jobsList);

        const firstJob = jobsList.find(
          (job) => job.status !== "closed"
        );

        if (firstJob) {
          setSelectedJobId(getId(firstJob));
        }
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(
              err,
              "Unable to load your profile and available jobs."
            )
          );
        }
      } finally {
        if (active) setLoadingPage(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const availableJobs = useMemo(
    () => jobs.filter((job) => job.status !== "closed"),
    [jobs]
  );

  const selectedJob = useMemo(
    () => jobs.find((job) => getId(job) === selectedJobId),
    [jobs, selectedJobId]
  );

  const profileSkills = getSkills(profile?.skills);

  const profileReady = Boolean(
    profile &&
      (profile.name ||
        profileSkills.length ||
        profile.education?.length ||
        profile.experience?.length)
  );

  function handleJobChange(value) {
    setSelectedJobId(value);
    setMatchResult(null);
    setError("");
  }

  async function analyzeMatch() {
    if (!profile) {
      setError("Your profile could not be loaded. Please refresh the page.");
      return;
    }

    if (!selectedJob) {
      setError("Please select a job before analyzing your match.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setMatchResult(null);

    try {
      const response = await api.post("/api/ai/job-match", {
        profile: {
          name: profile.name || "",
          skills: profileSkills,
          education: profile.education || [],
          experience: profile.experience || [],
          address: profile.address || "",
        },
        job: {
          title: selectedJob.title || "",
          company: selectedJob.company || "",
          description: selectedJob.description || "",
          skillsRequired: getSkills(selectedJob.skillsRequired),
          experience: selectedJob.experience || "",
          location: selectedJob.location || "",
          employmentType: selectedJob.employmentType || "",
        },
      });

      const result = response.data?.match;

      if (!result) {
        throw new Error("The AI did not return a match analysis. Try again.");
      }

      setMatchResult(result);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "AI matching failed. Please try again in a moment."
        )
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const score = Math.max(
    0,
    Math.min(100, Number(matchResult?.score) || 0)
  );

  const matchedSkills = getSkills(matchResult?.matchedSkills);
  const missingSkills = getSkills(matchResult?.missingSkills);

  const matchLabel =
    matchResult?.matchLevel ||
    (score >= 80
      ? "Excellent match"
      : score >= 60
        ? "Good match"
        : score >= 40
          ? "Moderate match"
          : "Needs improvement");

  if (loadingPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your AI workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-900 p-6 text-white sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-violet-100">
            <span>✦</span> AI-POWERED CAREER TOOL
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Find your perfect
            <span className="block text-violet-300">job match.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Discover how well your skills and experience align with a role.
            Get personalized insights and identify the skills you need to
            strengthen your application.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-slate-200 sm:text-sm">
            <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
              ✓ Skill comparison
            </span>
            <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
              ✓ Match percentage
            </span>
            <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
              ✓ Personalized insights
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <span className="text-lg">!</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Something needs your attention</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg px-2 py-1 font-bold hover:bg-red-100"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main content */}
        <div className="min-w-0 space-y-6">
          {/* Job selection */}
          <SectionCard
            title="Choose a job to analyze"
            subtitle="Select the role you want to compare with your profile."
            icon="⌕"
          >
            {availableJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <div className="text-3xl">▤</div>
                <h3 className="mt-3 font-bold text-slate-800">
                  No open jobs available
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  There are no open jobs to analyze right now. Check the Jobs
                  page again later.
                </p>
                <a
                  href="/jobs"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Browse jobs
                </a>
              </div>
            ) : (
              <>
                <label
                  htmlFor="job-match-select"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Available positions
                </label>

                <select
                  id="job-match-select"
                  value={selectedJobId}
                  onChange={(event) => handleJobChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Select a job</option>
                  {availableJobs.map((job) => (
                    <option key={getId(job)} value={getId(job)}>
                      {job.title || "Untitled position"} —{" "}
                      {job.company || "Company"}
                    </option>
                  ))}
                </select>

                {selectedJob && (
                  <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-violet-700 shadow-sm">
                        {getInitials(selectedJob.company)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-bold text-slate-900">
                          {selectedJob.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {selectedJob.company || "Company not specified"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedJob.location && (
                            <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600">
                              ⌖ {selectedJob.location}
                            </span>
                          )}
                          {selectedJob.employmentType && (
                            <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600">
                              ◷ {selectedJob.employmentType}
                            </span>
                          )}
                          {selectedJob.experience && (
                            <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600">
                              ▤ {selectedJob.experience}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {getSkills(selectedJob.skillsRequired).length > 0 && (
                      <div className="mt-5 border-t border-violet-100 pt-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Required skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getSkills(selectedJob.skillsRequired).map(
                            (skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={analyzeMatch}
                  disabled={!selectedJob || analyzing || !profile}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200/60 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto sm:min-w-56"
                >
                  {analyzing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Analyzing your match...
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      Analyze job match
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  AI results are estimates based on the profile and job
                  information available. Review the job description before
                  applying.
                </p>
              </>
            )}
          </SectionCard>

          {/* Result */}
          {analyzing && (
            <div className="rounded-2xl border border-violet-100 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                ✦
              </div>
              <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                Finding your match
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                AI is comparing your skills, experience and profile with the
                selected job requirements.
              </p>
              <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-600" />
              </div>
            </div>
          )}

          {!analyzing && matchResult && (
            <>
              <SectionCard
                title="Your AI match results"
                subtitle={`Analysis for ${selectedJob?.title || "the selected job"}.`}
                icon="✦"
              >
                <div className="flex flex-col items-center gap-5 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:p-6">
                  <ScoreCircle score={score} />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <span className="inline-flex rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-800">
                      {matchLabel}
                    </span>
                    <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                      {score >= 80
                        ? "You're a strong candidate!"
                        : score >= 60
                          ? "You're on the right track."
                          : score >= 40
                            ? "There's room to improve."
                            : "Let's strengthen your profile."}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {matchResult.recommendation ||
                        "Use the skill comparison below to identify your next steps."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Match score
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-violet-700">
                      {score}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Skills matched
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                      {matchedSkills.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Skills to learn
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-amber-700">
                      {missingSkills.length}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Your matching skills"
                subtitle="Skills the AI identified as matching the job requirements."
                icon="✓"
              >
                {matchedSkills.length ? (
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((skill, index) => (
                      <SkillTag key={`${skill}-${index}`}>{skill}</SkillTag>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    No matching skills were returned. Check whether your
                    profile lists your current skills.
                  </p>
                )}
              </SectionCard>

              <SectionCard
                title="Skills to improve"
                subtitle="Consider developing these skills to strengthen your fit for this role."
                icon="↗"
              >
                {missingSkills.length ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, index) => (
                        <SkillTag
                          key={`${skill}-${index}`}
                          type="missing"
                        >
                          {skill}
                        </SkillTag>
                      ))}
                    </div>
                    <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      <strong>Next step:</strong> Prioritize the skills most
                      relevant to the job description. Practice through
                      projects, coursework and interview preparation.
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    The AI did not identify any missing skills in this
                    analysis. Review the full job requirements to confirm.
                  </p>
                )}
              </SectionCard>

              <button
                type="button"
                onClick={analyzeMatch}
                disabled={analyzing}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
              >
                ↻ Analyze again
              </button>
            </>
          )}

          {!analyzing && !matchResult && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center sm:px-10 sm:py-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                ✧
              </div>
              <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                Your match report starts here
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Choose a position above and click Analyze job match to see
                your compatibility score, matched skills and improvement
                opportunities.
              </p>
            </div>
          )}
        </div>

        {/* Profile sidebar */}
        <aside className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-r from-violet-600 to-indigo-600" />

            <div className="px-5 pb-5">
              <div className="-mt-9 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border-4 border-white bg-violet-100 text-xl font-extrabold text-violet-700 shadow-sm">
                {getInitials(profile?.name)}
              </div>

              <h2 className="mt-3 break-words text-lg font-extrabold text-slate-900">
                {profile?.name || "Your profile"}
              </h2>
              <p className="mt-1 break-words text-sm text-slate-500">
                {profile?.email || "Add your email to your profile"}
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Profile readiness
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      profileReady ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {profileReady ? "Started" : "Incomplete"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {profileReady
                    ? "Keep your skills and experience updated for more useful AI results."
                    : "Add your skills, education and experience for a more meaningful analysis."}
                </p>
              </div>

              <a
                href="/profile"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
              >
                Edit my profile <span>→</span>
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">Your skill snapshot</h3>
            <p className="mt-1 text-sm text-slate-500">
              Skills currently saved in your profile.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {profileSkills.length ? (
                profileSkills.slice(0, 12).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm leading-6 text-amber-700">
                  No skills found. Add your skills to your profile first.
                </p>
              )}
            </div>

            {profileSkills.length > 12 && (
              <p className="mt-3 text-xs text-slate-500">
                +{profileSkills.length - 12} more skills
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              ✦
            </div>
            <h3 className="mt-4 font-bold text-slate-900">
              Make your next move
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A match score is a guide, not a hiring decision. Tailor your
              resume to relevant requirements and showcase your skills through
              practical projects.
            </p>
            <a
              href="/jobs"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900"
            >
              Explore more jobs <span>→</span>
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
