
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  MapPin,
  CalendarDays,
  Users,
  Trash2,
  RefreshCw,
  X,
  ArrowRight,
  CircleAlert,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api.js";

function formatDate(date) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RecruiterMyJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/jobs/recruiter/all");
      setJobs(response.data?.jobs || []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your job listings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        (job.title || "").toLowerCase().includes(query) ||
        (job.company || "").toLowerCase().includes(query) ||
        (job.location || "").toLowerCase().includes(query);

      const matchesStatus = status === "all" || (job.status || "open") === status;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, status]);

  const deleteJob = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");

    try {
      await api.delete(`/api/jobs/delete/${deleteTarget._id}`);
      setJobs((previous) =>
        previous.filter((job) => job._id !== deleteTarget._id)
      );
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete this job."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Recruitment workspace</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            My Job Listings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your openings and review the hiring activity for each role.
          </p>
        </div>

        <Link
          to="/recruiter/create-job"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
        >
          <Plus size={17} /> Post a new job
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total listings", value: jobs.length },
          { label: "Open positions", value: jobs.filter((job) => (job.status || "open") === "open").length },
          { label: "Closed positions", value: jobs.filter((job) => job.status === "closed").length },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchJobs} className="font-bold underline">Retry</button>
        </div>
      )}

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search job title, company or location"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <button
            type="button"
            onClick={fetchJobs}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <BriefcaseBusiness size={32} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-xl font-extrabold">
            {jobs.length ? "No matching listings" : "No job listings yet"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {jobs.length
              ? "Try changing the search or status filter."
              : "Create your first job listing to start receiving applications."}
          </p>
          {jobs.length === 0 && (
            <Link
              to="/recruiter/create-job"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <Plus size={16} /> Create a job
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filteredJobs.map((job) => (
            <article
              key={job._id}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BriefcaseBusiness size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-lg font-extrabold text-slate-950">
                    {job.title || "Untitled position"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {job.company || "Company"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  job.status === "closed"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}>
                  {job.status || "open"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} /> {job.location || "Location not set"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} /> Posted {formatDate(job.createdAt)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.employmentType && (
                  <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {job.employmentType}
                  </span>
                )}
                {job.experience && (
                  <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {job.experience}
                  </span>
                )}
                {job.salary && (
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    {job.salary}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                  to={`/recruiter/applications?jobId=${job._id}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  <Users size={16} /> Applications
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(job)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>
            <h3 className="mt-4 text-xl font-extrabold">Delete this job?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to delete <strong>{deleteTarget.title}</strong>.
              The backend also deletes applications associated with this job.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteJob}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
