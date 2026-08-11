import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Target,
  RefreshCw,
} from "lucide-react";

export default function AIJobMatch({ job }) {
  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const analyzeJobMatch = async () => {
    try {
      setLoading(true);
      setError("");

      // Get candidate profile first
      const profileRes = await fetch(
        "http://localhost:8000/api/profile/jobseeker",
        {
          credentials: "include",
        }
      );

      const profileData =
        await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(
          profileData.message ||
            "Failed to fetch profile"
        );
      }

      const profile =
        profileData.profile;

      // Send profile + job to AI backend
      const res = await fetch(
        "http://localhost:8000/api/ai/job-match",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            profile,
            job,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "AI job matching failed"
        );
      }

      setResult(data.match);
    } catch (err) {
      console.error(
        "AI Job Match Error:",
        err
      );

      setError(
        err.message ||
          "AI job matching failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm">

      {/* HEADER */}

      <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
            <Sparkles size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              AI Job Match
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Check how well your profile matches this job
            </p>
          </div>

        </div>
      </div>

      {/* BODY */}

      <div className="p-5">

        {!result &&
          !loading &&
          !error && (
            <>
              <div className="mb-4 rounded-lg bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  AI will compare your skills,
                  education and experience with
                  this job's requirements.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  analyzeJobMatch
                }
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                <Sparkles size={15} />
                Check My Match
              </button>
            </>
          )}

        {/* LOADING */}

        {loading && (
          <div className="py-7 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
              <Loader2
                size={22}
                className="animate-spin text-violet-600"
              />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              Analyzing your profile...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Comparing skills and job requirements
            </p>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">

            <div className="flex gap-2">

              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-xs font-bold text-red-700">
                  AI matching failed
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                analyzeJobMatch
              }
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800"
            >
              <RefreshCw size={13} />
              Try Again
            </button>
          </div>
        )}

        {/* RESULT */}

        {result && (
          <div className="space-y-5">

            {/* SCORE */}

            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-5 text-center">

              <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">
                AI Match Score
              </p>

              <p className="mt-2 text-4xl font-black text-slate-900">
                {result.score || 0}
                <span className="text-lg text-slate-400">
                  %
                </span>
              </p>

              <p className="mt-1 text-sm font-bold text-violet-700">
                {result.matchLevel ||
                  "Profile Match"}
              </p>

              <div className="mx-auto mt-4 h-2 max-w-[180px] overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        Number(
                          result.score || 0
                        ),
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* MATCHED SKILLS */}

            {result.matchedSkills
              ?.length > 0 && (
              <div>

                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-500"
                  />

                  <h4 className="text-xs font-bold text-slate-700">
                    Matching Skills
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">

                  {result.matchedSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* MISSING SKILLS */}

            {result.missingSkills
              ?.length > 0 && (
              <div>

                <div className="mb-2 flex items-center gap-2">
                  <Target
                    size={15}
                    className="text-amber-500"
                  />

                  <h4 className="text-xs font-bold text-slate-700">
                    Missing Skills
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">

                  {result.missingSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* RECOMMENDATION */}

            {result.recommendation && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <p className="text-xs font-bold text-slate-700">
                  AI Recommendation
                </p>

                <p className="mt-1.5 text-xs leading-5 text-slate-600">
                  {result.recommendation}
                </p>
              </div>
            )}

            {/* AGAIN */}

            <button
              type="button"
              onClick={
                analyzeJobMatch
              }
              disabled={loading}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white text-xs font-bold text-violet-700 transition hover:bg-violet-50"
            >
              <RefreshCw size={13} />
              Analyze Again
            </button>

          </div>
        )}
      </div>
    </div>
  );
}