import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function formatDate(date) {
  if (!date) return "Recently posted";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return "Recently posted";

  const difference = Math.floor(
    (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
  );

  if (difference <= 0) return "Posted today";
  if (difference === 1) return "Posted yesterday";
  if (difference < 30) return `Posted ${difference} days ago`;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(company) {
  return (company || "Company")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function JobCard({ job, saved, onToggleSave, canSave, saving }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-extrabold text-violet-700">
          {getInitials(job.company)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/jobs/${job._id}`}
                className="break-words text-lg font-extrabold text-slate-900 transition hover:text-violet-600"
              >
                {job.title || "Untitled position"}
              </Link>

              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Building2 size={15} className="shrink-0" />
                <span>{job.company || "Company not specified"}</span>
              </p>
            </div>

            {canSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job)}
                disabled={saving}
                aria-label={saved ? "Remove saved job" : "Save job"}
                title={saved ? "Remove saved job" : "Save job"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  saved
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-slate-200 text-slate-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.employmentType && (
              <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                {job.employmentType}
              </span>
            )}

            {job.experience && (
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {job.experience}
              </span>
            )}

            {job.status && (
              <span
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  job.status === "open"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {job.status === "open" ? "Open" : "Closed"}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {job.location || "Location not specified"}
            </span>

            {job.salary && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                {job.salary}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={15} />
              {formatDate(job.createdAt)}
            </span>
          </div>

          {job.description && (
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
              {job.description}
            </p>
          )}

          {Array.isArray(job.skillsRequired) &&
            job.skillsRequired.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skillsRequired.slice(0, 5).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}

                {job.skillsRequired.length > 5 && (
                  <span className="px-1 py-1 text-xs text-slate-500">
                    +{job.skillsRequired.length - 5} more
                  </span>
                )}
              </div>
            )}

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              View details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Jobs({ embedded = false } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );
  const [employmentType, setEmploymentType] = useState("all");

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingJobId, setSavingJobId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const jobsPerPage = 8;

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/jobs/all", {
        params: {
          page: 1,
          limit: 100,
          q: searchParams.get("search") || undefined,
        },
      });

      const data = response.data;

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (requestError) {
      console.error("Fetch jobs error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load jobs. Please check the backend API route."
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSavedJobs = useCallback(async () => {
    if (userRole !== "jobseeker") {
      setSavedJobIds([]);
      return;
    }

    try {
      const response = await api.get("/api/save/saved");

      const savedJobs = response.data.savedJobs || [];

      setSavedJobIds(
        savedJobs.map((job) => String(job._id))
      );
    } catch (requestError) {
      console.error("Fetch saved jobs error:", requestError);
      setSavedJobIds([]);
    }
  }, [userRole]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setLocation(searchParams.get("location") || "");
    setPage(1);
  }, [searchParams]);

  const filteredJobs = useMemo(() => {
    const locationQuery = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesLocation =
        !locationQuery ||
        (job.location || "").toLowerCase().includes(locationQuery);

      const matchesEmployment =
        employmentType === "all" ||
        job.employmentType === employmentType;

      return (
        matchesLocation &&
        matchesEmployment &&
        job.status !== "closed"
      );
    });
  }, [jobs, location, employmentType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / jobsPerPage)
  );

  const visibleJobs = filteredJobs.slice(
    (page - 1) * jobsPerPage,
    page * jobsPerPage
  );

  const handleSearch = (event) => {
    event.preventDefault();

    const nextParams = new URLSearchParams();

    if (searchTerm.trim()) {
      nextParams.set("search", searchTerm.trim());
    }

    if (location.trim()) {
      nextParams.set("location", location.trim());
    }

    setPage(1);
    setSearchParams(nextParams);
  };

  const handleToggleSave = async (job) => {
    if (!userRole) {
      toast.info("Please sign in to save jobs.");
      return;
    }

    if (userRole !== "jobseeker") {
      toast.info("Only job seekers can save jobs.");
      return;
    }

    const jobId = String(job._id);
    const alreadySaved = savedJobIds.includes(jobId);

    try {
      setSavingJobId(jobId);

      if (alreadySaved) {
        await api.post(`/api/save/unsave/${jobId}`);

        setSavedJobIds((previous) =>
          previous.filter((id) => id !== jobId)
        );

        toast.success("Job removed from saved jobs.");
      } else {
        await api.post(`/api/save/save/${jobId}`);

        setSavedJobIds((previous) =>
          previous.includes(jobId) ? previous : [...previous, jobId]
        );

        toast.success("Job saved successfully.");
      }
    } catch (requestError) {
      console.error("Toggle saved job error:", requestError);

      toast.error(
        requestError.response?.data?.message ||
          "Could not update saved jobs. Please sign in and try again."
      );
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {!embedded && (
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <BriefcaseBusiness size={21} />
              </span>

              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Career<span className="text-violet-600">AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {userRole === "jobseeker" && (
                <Link
                  to="/jobseeker/saved-jobs"
                  className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 sm:inline-flex"
                >
                  <Bookmark size={17} />
                  Saved jobs
                </Link>
              )}

              <Link
                to={userRole ? "/" : "/login"}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
              >
                {userRole ? "Home" : "Sign in"}
              </Link>

              {!userRole && (
                <Link
                  to="/register"
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Join now
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-violet-600">
            <Sparkles size={17} />
            Find your next opportunity
          </div>

          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Discover jobs that move your career forward.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Explore opportunities, compare requirements, and find a role that
            fits your skills and ambitions.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50 md:grid-cols-[1fr_0.75fr_auto]"
          >
            <label className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4">
              <Search size={19} className="shrink-0 text-violet-600" />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Job title, skill or keyword"
                aria-label="Search job title or skills"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4">
              <MapPin size={19} className="shrink-0 text-slate-400" />

              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or location"
                aria-label="Filter by location"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              <Search size={17} />
              Search jobs
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Latest opportunities
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Loading opportunities..."
                : `${filteredJobs.length} ${
                    filteredJobs.length === 1 ? "job" : "jobs"
                  } found`}
            </p>
          </div>

          <label className="flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:self-auto">
            <SlidersHorizontal size={17} className="text-slate-500" />

            <span className="text-sm font-semibold text-slate-600">
              Job type
            </span>

            <select
              value={employmentType}
              onChange={(event) => {
                setEmploymentType(event.target.value);
                setPage(1);
              }}
              className="max-w-[150px] bg-transparent text-sm font-semibold text-slate-800 outline-none"
            >
              <option value="all">All types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-1/4 rounded bg-slate-100" />
                <div className="mt-6 h-4 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-bold text-slate-900">Could not load jobs</p>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <button
              type="button"
              onClick={fetchJobs}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              Try again
            </button>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <BriefcaseBusiness size={26} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No matching jobs found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a different keyword or location, or clear the filters to
              explore more opportunities.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setLocation("");
                setEmploymentType("all");
                setPage(1);
                setSearchParams({});
              }}
              className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {visibleJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  saved={savedJobIds.includes(String(job._id))}
                  canSave={userRole === "jobseeker"}
                  saving={savingJobId === String(job._id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-current={page === pageNumber ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                      page === pageNumber
                        ? "bg-violet-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-xs leading-6 text-slate-400">
          Showing jobs returned by your job portal backend. Search and filters
          are based on the currently loaded job results.
        </p>
      </section>

      {!embedded && (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <Link to="/" className="font-extrabold text-slate-900">
              Career<span className="text-violet-600">AI</span>
            </Link>

            <p className="text-sm text-slate-500">
              Find your next opportunity with confidence.
            </p>

            <Link
              to="/"
              className="text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Back to home
            </Link>
          </div>
        </footer>
      )}
    </main>
  );
}