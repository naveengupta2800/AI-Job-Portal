
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Clock3,
  MapPin,
  IndianRupee,
  ArrowRight,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "/../context/AuthContext";

export default function SavedJobs() {
  const { userRole } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/save/saved");
      const savedJobs = response.data?.savedJobs || [];
      setJobs(savedJobs);
    } catch (err) {
      setError(err.message || "Unable to load saved jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const removeSavedJob = async (jobId) => {
    try {
      setRemovingId(jobId);
      await api.post(`/save/unsave/${jobId}`);
      setJobs((previousJobs) =>
        previousJobs.filter(
          (job) => (job._id || job.id) !== jobId
        )
      );
    } catch (err) {
      setError(err.message || "Could not remove this saved job.");
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently added";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently added";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <BriefcaseBusiness size={21} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Hire<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="hidden text-sm font-semibold text-slate-600 transition hover:text-violet-600 sm:inline-flex"
            >
              Explore jobs
            </Link>

            <Link
              to={userRole === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard"}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:border-violet-300 hover:bg-violet-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-indigo-300/20 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Bookmark size={24} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-100">
              Your career shortlist
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Saved jobs
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
              Keep your favourite opportunities in one place and come back
              whenever you are ready to apply.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold">
              <Bookmark size={17} />
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"} saved
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Your bookmarked opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review roles and continue your application journey.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSavedJobs}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchSavedJobs}
              className="self-start text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[1, 2, 4, 5].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-4 w-full rounded bg-slate-100" />
                <div className="mt-3 h-4 w-4/5 rounded bg-slate-100" />
                <div className="mt-7 h-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Bookmark size={29} />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No saved jobs yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When you find a role that interests you, bookmark it and
              it will appear here.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              <Search size={17} />
              Explore jobs
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {jobs.map((job) => {
              const jobId = job._id || job.id;
              const skills = Array.isArray(job.skillsRequired)
                ? job.skillsRequired
                : [];

              return (
                <article
                  key={jobId}
                  className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-200/60 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <Building2 size={23} />
                      </div>

                      <div className="min-w-0">
                        <Link
                          to={`/jobs/${jobId}`}
                          className="line-clamp-2 text-lg font-bold leading-6 transition hover:text-violet-700"
                        >
                          {job.title || "Untitled position"}
                        </Link>
                        <p className="mt-1 truncate text-sm font-medium text-slate-500">
                          {job.company || job.companyName || "Company"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSavedJob(jobId)}
                      disabled={removingId === jobId}
                      title="Remove saved job"
                      aria-label={`Remove ${job.title || "job"} from saved jobs`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        <MapPin size={13} />
                        {job.location}
                      </span>
                    )}

                    {job.employmentType && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        <BriefcaseBusiness size={13} />
                        {job.employmentType}
                      </span>
                    )}

                    {job.experience && (
                      <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        {job.experience}
                      </span>
                    )}
                  </div>

                  {job.salary && (
                    <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                      <IndianRupee size={15} />
                      {job.salary}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg border border-violet-100 bg-violet-50/70 px-2.5 py-1 text-xs font-medium text-violet-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="px-1 py-1 text-xs text-slate-500">
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 size={14} />
                    Saved opportunity · {formatDate(job.createdAt)}
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <Link
                      to={`/jobs/${jobId}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      View job details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
