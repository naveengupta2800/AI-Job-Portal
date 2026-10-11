
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api.js";

const STATUSES = ["Applied", "Shortlisted", "Interview", "Rejected", "Hired"];

const STATUS_STYLES = {
  Applied: "bg-blue-50 text-blue-700 ring-blue-200",
  Shortlisted: "bg-violet-50 text-violet-700 ring-violet-200",
  Interview: "bg-amber-50 text-amber-700 ring-amber-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Hired: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function normalizeApplications(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.applications)) return data.applications;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function StatusBadge({ status }) {
  const currentStatus = status || "Applied";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[currentStatus] || STATUS_STYLES.Applied
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {currentStatus}
    </span>
  );
}

function ApplicationCard({ application, onWithdraw, withdrawing }) {
  const job =
    application.job && typeof application.job === "object"
      ? application.job
      : null;

  const jobId = job?._id || application.job;
  const status = application.status || "Applied";
  const interview = application.interview;
  const timeline = Array.isArray(application.timeline)
    ? application.timeline
    : [];

  const canWithdraw = !["Rejected", "Hired"].includes(status);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-xl font-bold text-indigo-700">
            {(job?.company || job?.title || "J").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold text-slate-900">
                  {job?.title || "Job details unavailable"}
                </h3>
                <p className="mt-1 break-words text-sm font-medium text-slate-500">
                  {job?.company || "Company not available"}
                </p>
              </div>

              <StatusBadge status={status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span>📍 {job?.location || "Location not specified"}</span>
              <span>💰 {formatSalary(job?.salary)}</span>
              {job?.employmentType && (
                <span>{job.employmentType}</span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Application submitted
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(application.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Current status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {status}
                </p>
              </div>
            </div>

            {interview && (interview.date || interview.time) && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Interview scheduled
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {interview.date
                      ? formatDate(interview.date)
                      : "Date pending"}
                    {interview.time ? ` · ${interview.time}` : ""}
                  </p>
                </div>
              </div>
            )}

            {timeline.length > 0 && (
              <details className="mt-4 rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  View application timeline
                </summary>

                <ul className="mt-4 space-y-3">
                  {timeline.map((event, index) => (
                    <li
                      key={event._id || `${event.status || "event"}-${index}`}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {event.status || event.title || "Application update"}
                        </p>
                        {(event.date || event.createdAt) && (
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(event.date || event.createdAt)}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
              {jobId ? (
                <Link
                  to={`/jobs/${jobId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View job details <span>→</span>
                </Link>
              ) : (
                <span className="text-sm text-slate-400">
                  Job details unavailable
                </span>
              )}

              {canWithdraw && (
                <button
                  type="button"
                  onClick={() => onWithdraw(application)}
                  disabled={withdrawing}
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {withdrawing ? "Withdrawing..." : "Withdraw application"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [withdrawingId, setWithdrawingId] = useState("");
  const [confirmApplication, setConfirmApplication] = useState(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/apply/me");
      setApplications(normalizeApplications(data));
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your applications.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function handleWithdraw() {
    if (!confirmApplication?._id) return;

    setWithdrawingId(confirmApplication._id);
    setError("");
    setNotice("");

    try {
      const { data } = await api.delete(
        `/api/apply/${confirmApplication._id}`
      );

      setApplications((current) =>
        current.filter(
          (application) =>
            application._id !== confirmApplication._id
        )
      );

      setConfirmApplication(null);
      setNotice(data?.message || "Application withdrawn successfully.");
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to withdraw this application.")
      );
    } finally {
      setWithdrawingId("");
    }
  }

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const job =
        application.job && typeof application.job === "object"
          ? application.job
          : {};

      const searchableText = [
        job.title,
        job.company,
        job.location,
        application.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const countStatus = (status) =>
    applications.filter((application) => application.status === status).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              YOUR CAREER JOURNEY
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              My applications
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Track your applications, follow hiring updates, and keep your
              next career move organized.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-50 sm:self-auto"
          >
            Find more jobs <span>→</span>
          </Link>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {[
            { label: "Total", value: applications.length },
            { label: "Applied", value: countStatus("Applied") },
            { label: "Shortlisted", value: countStatus("Shortlisted") },
            { label: "Interviews", value: countStatus("Interview") },
            { label: "Hired", value: countStatus("Hired") },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"
            >
              <p className="text-sm text-slate-300">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">
                {loading ? "—" : item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{error}</p>
          <button type="button" onClick={() => setError("")} className="font-bold">
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
          <button type="button" onClick={() => setNotice("")} className="font-bold">
            ×
          </button>
        </div>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Application history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Check your progress for every job you've applied to.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jobs or companies..."
              className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-72"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
              aria-label="Filter applications by status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadApplications}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/2 rounded bg-slate-200" />
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                    <div className="h-16 rounded-xl bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
              {applications.length === 0 ? "📄" : "⌕"}
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              {applications.length === 0
                ? "No applications yet"
                : "No matching applications"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {applications.length === 0
                ? "Once you apply for a job, your application status and interview details will appear here."
                : "Try another search term or select a different status."}
            </p>

            {applications.length === 0 ? (
              <Link
                to="/jobs"
                className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Explore jobs →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onWithdraw={setConfirmApplication}
                withdrawing={withdrawingId === application._id}
              />
            ))}
          </div>
        )}
      </section>

      {confirmApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmApplication(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
              !
            </div>

            <h2
              id="withdraw-title"
              className="mt-5 text-xl font-bold text-slate-900"
            >
              Withdraw application?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to withdraw your application for{" "}
              <strong className="text-slate-800">
                {confirmApplication.job?.title || "this job"}
              </strong>
              ? This action will remove it from your application list.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmApplication(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep application
              </button>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={Boolean(withdrawingId)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawingId ? "Withdrawing..." : "Yes, withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
