
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  Trophy,
  Plus,
  ArrowRight,
  RefreshCw,
  MapPin,
  CalendarDays,
  Building2,
  CircleAlert,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api.js";

function StatCard({ title, value, icon: Icon, color, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Recently";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RecruiterDashboard() {
  const [summary, setSummary] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, jobsResponse] = await Promise.all([
        api.get("/api/apply/recruiter/dashboard-summary"),
        api.get("/api/jobs/recruiter/all"),
      ]);

      setSummary((previous) => ({
        ...previous,
        ...summaryResponse.data,
      }));

      setJobs(jobsResponse.data?.jobs || []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load recruiter dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = [
    {
      title: "Jobs posted",
      value: summary.totalJobs,
      description: "Your job listings",
      icon: BriefcaseBusiness,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Applications",
      value: summary.totalApplications,
      description: "Candidates who applied",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Shortlisted",
      value: summary.shortlisted,
      description: "Candidates shortlisted",
      icon: UserCheck,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Hired",
      value: summary.hired,
      description: "Successful hires",
      icon: Trophy,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Recruitment overview
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Recruiter Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage job openings and track your hiring progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            to="/recruiter/create-job"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Post a job
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={loadDashboard} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} value={loading ? "—" : stat.value} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">
                Recent job listings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep an eye on your latest openings.
              </p>
            </div>
            <Link
              to="/recruiter/my-jobs"
              className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-xl bg-slate-50 p-5">
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
              <BriefcaseBusiness size={30} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-bold text-slate-800">No jobs posted yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create your first opening to start receiving applications.
              </p>
              <Link
                to="/recruiter/create-job"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
              >
                <Plus size={16} /> Create job
              </Link>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {jobs.slice(0, 5).map((job) => (
                <div key={job._id} className="flex items-start gap-3 py-4 first:pt-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-bold text-slate-900">
                      {job.title || "Untitled position"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {job.location || "Location not set"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={13} /> {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    job.status === "closed"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {job.status || "open"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-lg">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <BriefcaseBusiness size={24} />
          </div>
          <h2 className="mt-5 text-xl font-extrabold">Build your hiring pipeline</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Publish clear job descriptions, review candidates and move suitable
            applicants through your recruitment process.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              to="/recruiter/create-job"
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-indigo-50"
            >
              Create a job listing <ArrowRight size={17} />
            </Link>
            <Link
              to="/recruiter/my-jobs"
              className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Manage existing jobs <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
