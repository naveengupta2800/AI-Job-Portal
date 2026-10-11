import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext";

function getId(value) {
  if (!value) return "";
  return typeof value === "object" ? value._id || value.id || "" : value;
}

function formatSalary(salary) {
  if (salary === undefined || salary === null || salary === "") {
    return "Not disclosed";
  }

  if (typeof salary === "number") {
    return `₹${salary.toLocaleString("en-IN")}`;
  }

  return String(salary);
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="border-b border-slate-100 px-5 py-6 last:border-b-0 sm:px-7 sm:py-7">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { userRole, loading: authLoading } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingActions, setCheckingActions] = useState(true);

  const isJobSeeker = userRole === "jobseeker";

  // Fetch public job details
  const loadJob = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/jobs/${jobId}`);
      const result = data?.job || data?.data || data;

      if (!result || !result._id) {
        setJob(null);
        setError("This job could not be found.");
        return;
      }

      setJob(result);
    } catch (err) {
      setJob(null);
      setError(getErrorMessage(err, "Unable to load job details."));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Fetch saved jobs and application status only for job seekers
  const loadJobActions = useCallback(async () => {
    if (authLoading) return;

    if (!isJobSeeker) {
      setIsSaved(false);
      setIsApplied(false);
      setCheckingActions(false);
      return;
    }

    setCheckingActions(true);

    try {
      const results = await Promise.allSettled([
        api.get("/api/save/saved"),
        api.get("/api/apply/me"),
      ]);

      const savedResult = results[0];
      const appliedResult = results[1];

      if (savedResult.status === "fulfilled") {
        const data = savedResult.value.data;
        const savedJobs = Array.isArray(data)
          ? data
          : data?.savedJobs || data?.jobs || [];

        setIsSaved(
          savedJobs.some((item) => getId(item?.job || item) === jobId)
        );
      } else {
        setIsSaved(false);
        console.error("Unable to load saved jobs:", savedResult.reason);
      }

      if (appliedResult.status === "fulfilled") {
        const data = appliedResult.value.data;
        const applications = Array.isArray(data)
          ? data
          : data?.applications || data?.data || [];

        setIsApplied(
          applications.some((item) => getId(item?.job) === jobId)
        );
      } else {
        setIsApplied(false);
        console.error(
          "Unable to load application status:",
          appliedResult.reason
        );
      }
    } finally {
      setCheckingActions(false);
    }
  }, [authLoading, isJobSeeker, jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  useEffect(() => {
    if (authLoading) return;
    loadJobActions();
  }, [authLoading, loadJobActions]);

  async function handleSaveToggle() {
    if (!job?._id || saving) return;

    if (!isJobSeeker) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (isSaved) {
        await api.post(`/api/save/unsave/${job._id}`);
        setIsSaved(false);
        setNotice("Job removed from your saved jobs.");
      } else {
        await api.post(`/api/save/save/${job._id}`);
        setIsSaved(true);
        setNotice("Job saved successfully.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update your saved jobs."));
    } finally {
      setSaving(false);
    }
  }

  async function handleApply() {
    if (!job?._id || applying || isApplied) return;

    if (!isJobSeeker) {
      navigate("/login");
      return;
    }

    if (isClosed) return;

    setApplying(true);
    setError("");
    setNotice("");

    try {
      const { data } = await api.post(`/api/apply/${job._id}`);

      setIsApplied(true);
      setNotice(data?.message || "Application submitted successfully.");
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Unable to submit your application."
      );

      if (/already applied|already submitted|duplicate/i.test(message)) {
        setIsApplied(true);
        setNotice("You have already applied for this job.");
      } else {
        setError(message);
      }
    } finally {
      setApplying(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-5 pb-10">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <div className="flex gap-5">
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-8 h-36 rounded-2xl bg-slate-100" />
          <div className="mt-5 h-36 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
          !
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Job unavailable
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {error || "This job may have been removed or is no longer available."}
        </p>

        <Link
          to="/jobs"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  const skills = Array.isArray(job.skillsRequired) ? job.skillsRequired : [];

  const responsibilities = Array.isArray(job.responsibility)
    ? job.responsibility
    : job.responsibility
      ? [job.responsibility]
      : [];

  const isClosed = job.status === "closed";
  const postedDate = formatDate(job.createdAt);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <span aria-hidden="true">←</span> Back
      </button>

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
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-300" />

            <div className="p-5 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl font-bold text-indigo-700">
                  {(job.company || job.title || "J").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {job.employmentType || "Job opportunity"}
                    </span>

                    {isClosed && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Closed
                      </span>
                    )}

                    {job.status === "open" && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Open
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {job.title}
                  </h1>

                  <p className="mt-2 break-words text-base font-medium text-slate-600">
                    {job.company}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">
                    <span>📍 {job.location || "Location not specified"}</span>
                    <span>💰 {formatSalary(job.salary)}</span>
                    {job.experience && <span>💼 {job.experience}</span>}
                  </div>

                  {postedDate && (
                    <p className="mt-4 text-xs text-slate-400">
                      Posted on {postedDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={
                    applying ||
                    isApplied ||
                    isClosed ||
                    checkingActions
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {applying
                    ? "Submitting application..."
                    : isApplied
                      ? "✓ Already applied"
                      : isClosed
                        ? "Applications closed"
                        : !isJobSeeker
                          ? "Login to apply"
                          : "Apply for this job"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={saving || checkingActions}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                >
                  <span className="text-lg">{isSaved ? "♥" : "♡"}</span>
                  {saving
                    ? "Updating..."
                    : isSaved
                      ? "Saved"
                      : !isJobSeeker
                        ? "Login to save"
                        : "Save job"}
                </button>
              </div>

              {!isJobSeeker && (
                <p className="mt-3 text-xs text-slate-500">
                  Log in with your job seeker account to save jobs or apply.
                </p>
              )}
            </div>
          </section>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Section title="About this role">
              <div className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                {job.description || "No job description has been provided."}
              </div>
            </Section>

            {responsibilities.length > 0 && (
              <Section title="Responsibilities">
                <ul className="space-y-3">
                  {responsibilities.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <span className="break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section title="Required skills">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Specific skills have not been listed.
                </p>
              )}
            </Section>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Job overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Key details at a glance
            </p>

            <div className="mt-5 space-y-3">
              <InfoItem
                icon="💰"
                label="Salary"
                value={formatSalary(job.salary)}
              />
              <InfoItem
                icon="📍"
                label="Location"
                value={job.location}
              />
              <InfoItem
                icon="💼"
                label="Employment type"
                value={job.employmentType}
              />
              <InfoItem
                icon="🎯"
                label="Experience"
                value={job.experience}
              />
              {job.closeDate && (
                <InfoItem
                  icon="📅"
                  label="Application deadline"
                  value={formatDate(job.closeDate) || job.closeDate}
                />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              ✨
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Interested in this role?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review the requirements and submit your application when you're ready.
            </p>

            <button
              type="button"
              onClick={handleApply}
              disabled={
                applying ||
                isApplied ||
                isClosed ||
                checkingActions
              }
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isApplied
                ? "Application submitted"
                : isClosed
                  ? "Job closed"
                  : applying
                    ? "Applying..."
                    : !isJobSeeker
                      ? "Login to apply"
                      : "Apply now →"}
            </button>

            <Link
              to="/applied"
              className="mt-3 block text-center text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              View my applications
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}