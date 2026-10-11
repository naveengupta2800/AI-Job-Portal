import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const getJobId = (job) => job?._id || job?.id;

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function StatCard({ title, value, subtitle, icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {formatNumber(value)}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total, color, icon }) {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
          <span>{icon}</span>
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-bold tabular-nums text-slate-900">
          {formatNumber(value)}
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={Math.max(total, 1)}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function JobStatusBadge({ status }) {
  const isOpen = status === "open";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        isOpen
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOpen ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}

export default function RecruiterAnalytics() {
  const [summary, setSummary] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, jobsResponse] = await Promise.all([
        api.get("/api/apply/recruiter/dashboard-summary"),
        api.get("/api/jobs/recruiter/all"),
      ]);

      const summaryData = summaryResponse.data || {};
      const jobsData = jobsResponse.data || {};

      setSummary({
        totalJobs: Number(
          summaryData.totalJobs ?? jobsData.totalJobs ?? 0
        ),
        totalApplications: Number(summaryData.totalApplications ?? 0),
        shortlisted: Number(summaryData.shortlisted ?? 0),
        hired: Number(summaryData.hired ?? 0),
      });

      const jobList = Array.isArray(jobsData)
        ? jobsData
        : Array.isArray(jobsData.jobs)
          ? jobsData.jobs
          : [];

      setJobs(jobList);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load recruiter analytics. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const jobStats = useMemo(() => {
    const open = jobs.filter((job) => job.status !== "closed").length;
    const closed = jobs.filter((job) => job.status === "closed").length;

    const types = jobs.reduce((accumulator, job) => {
      const type = job.employmentType || "Unspecified";
      accumulator[type] = (accumulator[type] || 0) + 1;
      return accumulator;
    }, {});

    return { open, closed, types };
  }, [jobs]);

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [jobs]);

  const hireRate =
    summary.totalApplications > 0
      ? Math.round((summary.hired / summary.totalApplications) * 100)
      : 0;

  const shortlistRate =
    summary.totalApplications > 0
      ? Math.round(
          (summary.shortlisted / summary.totalApplications) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your hiring analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-violet-100">
              <span>▥</span> RECRUITMENT INSIGHTS
            </span>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Hiring Analytics
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Monitor your job listings, track your application pipeline and
              understand your hiring performance from one place.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="/recruiter/my-jobs"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              My jobs
            </a>
            <a
              href="/recruiter/create-job"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-50"
            >
              <span>+</span> Post a job
            </a>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-sm text-red-800">
            <p className="font-bold">Couldn't load analytics</p>
            <p className="mt-1 break-words">{error}</p>
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            className="shrink-0 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {/* Main stats */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Hiring overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Summary of your recruitment activity
            </p>
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
          >
            <span>↻</span>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title="Total job listings"
            value={summary.totalJobs}
            subtitle={`${jobStats.open} open positions`}
            icon="💼"
            iconClass="bg-violet-50"
          />

          <StatCard
            title="Total applications"
            value={summary.totalApplications}
            subtitle="Applications received"
            icon="📨"
            iconClass="bg-blue-50"
          />

          <StatCard
            title="Shortlisted"
            value={summary.shortlisted}
            subtitle="Candidates progressing"
            icon="✓"
            iconClass="bg-amber-50"
          />

          <StatCard
            title="Candidates hired"
            value={summary.hired}
            subtitle="Successful hires"
            icon="🎉"
            iconClass="bg-emerald-50"
          />
        </div>
      </section>

      {/* Analytics panels */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-slate-900">
                Job listing status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current status of your job postings
              </p>
            </div>
            <span className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
              {formatNumber(jobs.length)} listings
            </span>
          </div>

          <div className="mt-7 space-y-6">
            <ProgressRow
              label="Open positions"
              value={jobStats.open}
              total={jobs.length}
              color="bg-emerald-500"
              icon="🟢"
            />

            <ProgressRow
              label="Closed positions"
              value={jobStats.closed}
              total={jobs.length}
              color="bg-slate-400"
              icon="⚪"
            />
          </div>

          {jobs.length === 0 && (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Your job listing statistics will appear here when you post jobs.
            </p>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <a
              href="/recruiter/my-jobs"
              className="text-sm font-bold text-violet-700 hover:text-violet-900"
            >
              Manage job listings →
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-extrabold text-slate-900">
              Hiring funnel
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              How candidates are progressing through recruitment
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs font-semibold text-blue-700">
                Applications
              </p>
              <p className="mt-2 text-2xl font-extrabold text-blue-900">
                {formatNumber(summary.totalApplications)}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Total received
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-xs font-semibold text-amber-700">
                Shortlisted
              </p>
              <p className="mt-2 text-2xl font-extrabold text-amber-900">
                {formatNumber(summary.shortlisted)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {shortlistRate}% of applications
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold text-emerald-700">Hired</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">
                {formatNumber(summary.hired)}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {hireRate}% of applications
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <ProgressRow
              label="Shortlist rate"
              value={summary.shortlisted}
              total={summary.totalApplications}
              color="bg-amber-500"
              icon="◆"
            />

            <ProgressRow
              label="Hiring rate"
              value={summary.hired}
              total={summary.totalApplications}
              color="bg-emerald-500"
              icon="✓"
            />
          </div>

          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Rates are calculated from the available aggregate counts. They
            describe your current totals, not a time-based conversion trend.
          </p>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <a
              href="/recruiter/applications"
              className="text-sm font-bold text-violet-700 hover:text-violet-900"
            >
              Review applications →
            </a>
          </div>
        </section>
      </div>

      {/* Job type breakdown */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-extrabold text-slate-900">
            Employment type breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Distribution of your listings by employment type
          </p>
        </div>

        {Object.keys(jobStats.types).length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(jobStats.types).map(([type, count]) => {
              const percentage =
                jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0;

              return (
                <div
                  key={type}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {type}
                    </p>
                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      {percentage}%
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-extrabold text-slate-900">
                    {formatNumber(count)}
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
            <p className="font-semibold text-slate-700">
              No employment data yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Create a job listing to see the employment type breakdown.
            </p>
            <a
              href="/recruiter/create-job"
              className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
            >
              Post your first job
            </a>
          </div>
        )}
      </section>

      {/* Recent jobs */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-extrabold text-slate-900">
              Recent job listings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest published positions
            </p>
          </div>

          <a
            href="/recruiter/my-jobs"
            className="text-sm font-bold text-violet-700 hover:text-violet-900"
          >
            View all jobs →
          </a>
        </div>

        {recentJobs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentJobs.map((job) => (
              <div
                key={getJobId(job)}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 font-extrabold text-violet-700">
                    {(job.company || job.title || "J")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="break-words font-bold text-slate-900">
                      {job.title || "Untitled position"}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      {job.company || "Company not specified"}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Posted {formatDate(job.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  {job.employmentType && (
                    <span className="text-xs font-medium text-slate-500">
                      {job.employmentType}
                    </span>
                  )}
                  <JobStatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl">💼</div>
            <h3 className="mt-3 font-bold text-slate-900">
              No job listings yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Publish your first position to start tracking recruitment.
            </p>
            <a
              href="/recruiter/create-job"
              className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              + Create a job
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
