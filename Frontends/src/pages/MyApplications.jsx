
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";

const filters = ["All", "Applied", "Shortlisted", "Interview", "Rejected", "Hired"];

function getStatusStyle(status) {
  const styles = {
    Applied: "bg-amber-50 text-amber-700",
    Shortlisted: "bg-violet-50 text-violet-700",
    Interview: "bg-blue-50 text-blue-700",
    Rejected: "bg-red-50 text-red-700",
    Hired: "bg-emerald-50 text-emerald-700",
  };

  return styles[status] || "bg-slate-100 text-slate-600";
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Date unavailable";

  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [confirmApplication, setConfirmApplication] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/apply/me");
      setApplications(response.data?.applications || []);
    } catch (err) {
      setError(err.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const withdrawApplication = async () => {
    if (!confirmApplication) return;

    const applicationId = confirmApplication._id;

    try {
      setWithdrawingId(applicationId);
      await api.delete(`/apply/${applicationId}`);

      setApplications((previous) =>
        previous.filter((item) => item._id !== applicationId)
      );
      setConfirmApplication(null);
    } catch (err) {
      setError(err.message || "Unable to withdraw this application.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const visibleApplications = applications.filter((application) => {
    const job = application.job || {};
    const matchesStatus =
      activeFilter === "All" || application.status === activeFilter;

    const query = search.toLowerCase();
    const matchesSearch =
      (job.title || "").toLowerCase().includes(query) ||
      (job.company || "").toLowerCase().includes(query) ||
      (job.location || "").toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const canWithdraw = (status) =>
    !["Interview", "Hired"].includes(status);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <BriefcaseBusiness size={21} />
            </span>
            <span className="text-xl font-extrabold">
              Hire<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/jobseeker/dashboard"
              className="hidden text-sm font-semibold text-slate-600 hover:text-violet-700 sm:inline"
            >
              Dashboard
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
            >
              <Search size={16} />
              Find jobs
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-9">
          <p className="text-sm font-semibold text-violet-100">
            Your job search tracker
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            My Applications
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
            Track every opportunity, review application statuses, and stay
            organised throughout your job search.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-violet-100">Total applications</p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : applications.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-violet-100">Interviews</p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading
                  ? "—"
                  : applications.filter((item) => item.status === "Interview").length}
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-xs text-violet-100">Shortlisted</p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading
                  ? "—"
                  : applications.filter((item) => item.status === "Shortlisted").length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Application history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All your submitted applications in one place.
            </p>
          </div>

          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 lg:max-w-sm">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, company, location..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeFilter === filter
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
              }`}
            >
              {filter}
              {filter === "All" && !loading && (
                <span className="ml-2 opacity-75">{applications.length}</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchApplications}
              className="self-start text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/4 rounded bg-slate-100" />
                <div className="mt-6 h-10 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : visibleApplications.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FileText size={26} />
            </div>
            <h3 className="mt-4 text-xl font-extrabold">
              {applications.length === 0
                ? "No applications yet"
                : "No matching applications"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {applications.length === 0
                ? "Explore available jobs and apply for roles that match your skills."
                : "Try changing the search term or selecting a different status."}
            </p>
            {applications.length === 0 && (
              <Link
                to="/jobs"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                Browse jobs <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleApplications.map((application) => {
              const job = application.job || {};
              const jobId = job._id || job.id;

              return (
                <article
                  key={application._id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <Building2 size={22} />
                      </div>

                      <div className="min-w-0">
                        <Link
                          to={jobId ? `/jobs/${jobId}` : "/jobs"}
                          className="break-words text-lg font-extrabold hover:text-violet-700"
                        >
                          {job.title || "Job position"}
                        </Link>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {job.company || "Company"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          {job.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} /> {job.location}
                            </span>
                          )}
                          {job.employmentType && (
                            <span className="inline-flex items-center gap-1.5">
                              <BriefcaseBusiness size={14} />
                              {job.employmentType}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            Applied {formatDate(application.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(application.status)}`}
                    >
                      {application.status || "Applied"}
                    </span>
                  </div>

                  {application.status === "Interview" && application.interview?.date && (
                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-blue-800">
                        <CalendarDays size={16} /> Interview scheduled
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        {formatDate(application.interview.date)}
                        {application.interview.time
                          ? ` · ${application.interview.time}`
                          : ""}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                    <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={14} />
                      Last updated {formatDate(application.updatedAt)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {canWithdraw(application.status) && (
                        <button
                          type="button"
                          onClick={() => setConfirmApplication(application)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} /> Withdraw
                        </button>
                      )}

                      <Link
                        to={jobId ? `/jobs/${jobId}` : "/jobs"}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                      >
                        View job <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {confirmApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={21} />
              </div>
              <button
                type="button"
                onClick={() => setConfirmApplication(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close confirmation"
              >
                <X size={19} />
              </button>
            </div>

            <h3 className="mt-4 text-xl font-extrabold">Withdraw application?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to withdraw your application for{" "}
              <span className="font-semibold text-slate-800">
                {confirmApplication.job?.title || "this job"}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmApplication(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Keep application
              </button>
              <button
                type="button"
                onClick={withdrawApplication}
                disabled={withdrawingId === confirmApplication._id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawingId === confirmApplication._id
                  ? "Withdrawing..."
                  : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
