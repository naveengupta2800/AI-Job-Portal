
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api.js";

function formatSalary(salary) {
  if (salary === undefined || salary === null || salary === "") {
    return "Salary not specified";
  }

  if (typeof salary === "number") {
    return `₹${salary.toLocaleString("en-IN")}`;
  }

  return String(salary);
}

function JobCard({ job, onRemove, removing }) {
  const skills = Array.isArray(job.skillsRequired)
    ? job.skillsRequired
    : [];

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-xl font-bold text-indigo-700">
          {(job.company || job.title || "J").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <Link
                to={`/jobs/${job._id}`}
                className="break-words text-lg font-bold text-slate-900 transition hover:text-indigo-600"
              >
                {job.title || "Untitled position"}
              </Link>
              <p className="mt-1 break-words text-sm font-medium text-slate-500">
                {job.company || "Company not specified"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(job._id)}
              disabled={removing}
              title="Remove saved job"
              aria-label={`Remove ${job.title || "job"} from saved jobs`}
              className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl border border-slate-200 text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {removing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.location && (
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                📍 {job.location}
              </span>
            )}

            {job.employmentType && (
              <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                {job.employmentType}
              </span>
            )}

            {job.experience && (
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                {job.experience}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-900">
              {formatSalary(job.salary)}
            </p>
          </div>

          {skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.slice(0, 5).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-2 py-1 text-xs text-slate-400">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-400">
              Saved for later
            </span>

            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              View job details
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSavedJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/save/saved");
      const savedJobs = Array.isArray(data?.savedJobs)
        ? data.savedJobs
        : [];

      setJobs(savedJobs.filter(Boolean));
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your saved jobs.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  async function removeJob(jobId) {
    setRemovingId(jobId);
    setError("");
    setNotice("");

    try {
      await api.post(`/api/save/unsave/${jobId}`);

      setJobs((current) =>
        current.filter((job) => job._id !== jobId)
      );

      setNotice("Job removed from your saved list.");
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to remove this saved job.")
      );
    } finally {
      setRemovingId("");
    }
  }

  const jobTypes = useMemo(
    () => [
      "All",
      ...new Set(
        jobs.map((job) => job.employmentType).filter(Boolean)
      ),
    ],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        ...(Array.isArray(job.skillsRequired)
          ? job.skillsRequired
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesType =
        typeFilter === "All" || job.employmentType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [jobs, search, typeFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-1/3 h-44 w-44 rounded-full bg-violet-300/20 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-50">
              <span>♡</span>
              YOUR COLLECTION
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Saved jobs
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
              Keep track of opportunities you like and come back to them
              whenever you are ready to apply.
            </p>
          </div>

          <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/20 bg-white/10 text-4xl backdrop-blur-sm sm:self-auto">
            ♡
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm text-indigo-100">Total saved</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "—" : jobs.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm text-indigo-100">Showing results</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "—" : filteredJobs.length}
            </p>
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
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
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

      <section>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and organize the jobs you have bookmarked.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-72">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, company, skill..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              aria-label="Filter by employment type"
            >
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All job types" : type}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadSavedJobs}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-slate-100" />
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-8 w-full rounded bg-slate-100" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
              ♡
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              {jobs.length === 0
                ? "No saved jobs yet"
                : "No matching jobs found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {jobs.length === 0
                ? "Explore available opportunities and save the ones you want to revisit later."
                : "Try another search term or select a different job type."}
            </p>

            {jobs.length === 0 && (
              <Link
                to="/jobs"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Explore jobs <span aria-hidden="true">→</span>
              </Link>
            )}

            {jobs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("All");
                }}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onRemove={removeJob}
                removing={removingId === job._id}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="font-bold text-slate-900">
            Still looking for the right opportunity?
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Discover more jobs that match your career goals.
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Browse jobs <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
