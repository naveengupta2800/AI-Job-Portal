
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api.js";

const STATUSES = ["Applied", "Shortlisted", "Interview", "Rejected", "Hired"];

const statusStyles = {
  Applied: "bg-blue-50 text-blue-700 ring-blue-200",
  Shortlisted: "bg-violet-50 text-violet-700 ring-violet-200",
  Interview: "bg-amber-50 text-amber-700 ring-amber-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Hired: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function getId(value) {
  return typeof value === "object" ? value?._id : value;
}

function getResumeUrl(resume) {
  if (!resume) return "";
  if (/^https?:\/\//i.test(resume)) return resume;

  const baseURL = api.defaults.baseURL || "http://localhost:5000";
  return `${baseURL.replace(/\/$/, "")}/${resume.replace(/^\//, "")}`;
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export default function RecruiterApplications() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(
    searchParams.get("jobId") || ""
  );
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState("");
  const [scheduleFor, setScheduleFor] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    setError("");

    try {
      const { data } = await api.get("/api/jobs/recruiter/all");
      const list = Array.isArray(data?.jobs) ? data.jobs : [];
      setJobs(list);

      const queryJobId = searchParams.get("jobId");
      const queryJobExists = list.some((job) => job._id === queryJobId);

      setSelectedJobId((current) => {
        if (current && list.some((job) => job._id === current)) return current;
        if (queryJobExists) return queryJobId;
        return list[0]?._id || "";
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your job listings."));
    } finally {
      setLoadingJobs(false);
    }
  }, [searchParams]);

  const loadApplications = useCallback(async () => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    setLoadingApplications(true);
    setError("");

    try {
      const { data } = await api.get(`/api/apply/job/${selectedJobId}`);
      const list = Array.isArray(data)
        ? data
        : data?.applications || data?.applicants || [];

      setApplications(list);
    } catch (err) {
      setApplications([]);
      setError(getErrorMessage(err, "Could not load applicants for this job."));
    } finally {
      setLoadingApplications(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (selectedJobId) {
      setSearchParams({ jobId: selectedJobId }, { replace: true });
      loadApplications();
    } else if (!loadingJobs) {
      setApplications([]);
    }
  }, [selectedJobId, loadApplications, loadingJobs, setSearchParams]);

  async function updateStatus(applicationId, status) {
    setUpdatingId(applicationId);
    setNotice("");
    setError("");

    try {
      const { data } = await api.patch(`/api/apply/${applicationId}/status`, {
        status,
      });

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? { ...application, ...data, status: data?.status || status }
            : application
        )
      );

      setNotice(`Application status updated to ${status}.`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update application status."));
    } finally {
      setUpdatingId("");
    }
  }

  async function scheduleInterview(event) {
    event.preventDefault();
    if (!scheduleFor) return;

    setScheduling(true);
    setError("");
    setNotice("");

    try {
      await api.patch(`/api/apply/${scheduleFor._id}/interview`, {
        date: interviewDate,
        time: interviewTime,
      });

      setApplications((current) =>
        current.map((application) =>
          application._id === scheduleFor._id
            ? {
                ...application,
                status: "Interview",
                interview: { date: interviewDate, time: interviewTime },
              }
            : application
        )
      );

      setNotice("Interview scheduled successfully.");
      setScheduleFor(null);
      setInterviewDate("");
      setInterviewTime("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not schedule the interview."));
    } finally {
      setScheduling(false);
    }
  }

  const filteredApplications = applications.filter((application) => {
    const applicant = application.applicant || {};
    const query = search.toLowerCase();

    const matchesSearch =
      (applicant.name || "").toLowerCase().includes(query) ||
      (applicant.email || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countStatus = (status) =>
    applications.filter((application) => application.status === status).length;

  if (loadingJobs) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Recruitment workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Applications
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Review candidates, manage hiring stages, and schedule interviews
            from one place.
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Select job listing
          </label>
          <select
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            {jobs.length === 0 && <option value="">No job listings yet</option>}
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} — {job.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={() => setError("")} className="font-bold">×</button>
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{notice}</p>
          <button onClick={() => setNotice("")} className="font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total applicants"
          value={applications.length}
          icon="👥"
          color="bg-indigo-50"
        />
        <StatCard
          label="Shortlisted"
          value={countStatus("Shortlisted")}
          icon="✓"
          color="bg-violet-50 text-violet-700"
        />
        <StatCard
          label="Interviews"
          value={countStatus("Interview")}
          icon="📅"
          color="bg-amber-50"
        />
        <StatCard
          label="Hired"
          value={countStatus("Hired")}
          icon="★"
          color="bg-emerald-50 text-emerald-700"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Candidate pipeline</h2>
              <p className="mt-1 text-sm text-slate-500">
                {jobs.find((job) => job._id === selectedJobId)?.title ||
                  "Choose a job to view candidates"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                className="min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-64"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="All">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={loadApplications}
                disabled={!selectedJobId || loadingApplications}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingApplications ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {loadingApplications ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading candidates...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              👥
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {applications.length === 0 ? "No applications yet" : "No matching candidates"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {applications.length === 0
                ? "Applications for this job will appear here when candidates apply."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApplications.map((application) => {
              const applicant = application.applicant || {};
              const resumeUrl = getResumeUrl(applicant.resume || application.resume);
              const status = application.status || "Applied";
              const applicationId = application._id;

              return (
                <article
                  key={applicationId}
                  className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">
                        {(applicant.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-slate-900">
                          {applicant.name || "Candidate"}
                        </h3>
                        <p className="mt-1 break-all text-sm text-slate-500">
                          {applicant.email || "Email not available"}
                        </p>
                        {applicant.phone && (
                          <p className="mt-1 text-sm text-slate-500">
                            {applicant.phone}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Applied}`}>
                            {status}
                          </span>
                          {application.interview?.date && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                              Interview: {application.interview.date}
                              {application.interview.time ? ` · ${application.interview.time}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-white"
                        >
                          View resume ↗
                        </a>
                      ) : (
                        <span className="text-center text-xs text-slate-400">
                          Resume unavailable
                        </span>
                      )}

                      <select
                        aria-label={`Update status for ${applicant.name || "candidate"}`}
                        value={status}
                        disabled={updatingId === applicationId}
                        onChange={(event) => updateStatus(applicationId, event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        {STATUSES.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          setScheduleFor(application);
                          setInterviewDate(application.interview?.date || "");
                          setInterviewTime(application.interview?.time || "");
                        }}
                        disabled={!["Shortlisted", "Interview"].includes(status)}
                        title={
                          ["Shortlisted", "Interview"].includes(status)
                            ? "Schedule interview"
                            : "Shortlist the candidate first"
                        }
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {scheduleFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setScheduleFor(null);
          }}
        >
          <form
            onSubmit={scheduleInterview}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-600">Interview planning</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Schedule interview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Candidate: {scheduleFor.applicant?.name || "Candidate"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleFor(null)}
                className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Interview date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={interviewDate}
                  onChange={(event) => setInterviewDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Interview time
                </label>
                <input
                  type="time"
                  required
                  value={interviewTime}
                  onChange={(event) => setInterviewTime(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setScheduleFor(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduling}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {scheduling ? "Scheduling..." : "Confirm interview"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
