import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api.js";

const getId = (item) => item?._id || item?.id || "";

const getDate = (date) => {
  if (!date) return "Recently";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Recently";

  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status = "Applied") => {
  const styles = {
    Applied: "bg-blue-50 text-blue-700 ring-blue-600/10",
    Shortlisted: "bg-violet-50 text-violet-700 ring-violet-600/10",
    Interview: "bg-amber-50 text-amber-700 ring-amber-600/10",
    Rejected: "bg-red-50 text-red-700 ring-red-600/10",
    Hired: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  };

  return styles[status] || "bg-slate-100 text-slate-700 ring-slate-500/10";
};

function StatCard({ icon, label, value, caption, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{caption}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${iconStyle}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, description, action, to }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action && (
        <Link
          to={to}
          className="text-sm font-bold text-violet-700 transition hover:text-violet-900"
        >
          {action} →
        </Link>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description, action, to }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action && (
        <Link
          to={to}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

export default function JobSeekerDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/api/profile/jobseeker"),
        api.get("/api/apply/me"),
        api.get("/api/jobs/all"),
      ]);

      const [profileResult, applicationsResult, jobsResult] = results;
      const failures = [];

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data?.profile || null);
      } else {
        failures.push("profile");
      }

      if (applicationsResult.status === "fulfilled") {
        const data = applicationsResult.value.data;
        const list = Array.isArray(data)
          ? data
          : data?.applications || data?.data || [];

        setApplications(list);
      } else {
        setApplications([]);
        failures.push("applications");
      }

      if (jobsResult.status === "fulfilled") {
        const data = jobsResult.value.data;
        const list = Array.isArray(data)
          ? data
          : data?.jobs || data?.data || [];

        setJobs(list.filter((job) => job.status !== "closed"));
      } else {
        setJobs([]);
        failures.push("jobs");
      }

      if (failures.length === 3) {
        setError("We couldn't load your dashboard. Please try again.");
      } else if (failures.length > 0) {
        setError(
          `Some dashboard information could not be loaded: ${failures.join(", ")}.`
        );
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const countStatus = (status) =>
      applications.filter(
        (application) =>
          String(application.status || "Applied").toLowerCase() ===
          status.toLowerCase()
      ).length;

    return {
      total: applications.length,
      shortlisted: countStatus("Shortlisted"),
      interviews: countStatus("Interview"),
      hired: countStatus("Hired"),
    };
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [applications]);

  const latestJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [jobs]);

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const hasProfileDetails = Boolean(
    profile?.name ||
      skills.length ||
      profile?.education?.length ||
      profile?.experience?.length
  );

  const firstName = profile?.name?.trim()?.split(/\s+/)[0] || "there";

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-6 text-white sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-36 w-36 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-100">
              <span>✦</span> YOUR CAREER WORKSPACE
            </span>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Keep your placement journey moving. Track your applications,
              discover new opportunities and get ready for your next interview.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-50"
              >
                Find jobs <span>→</span>
              </Link>
              <Link
                to="/applied"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Track applications
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-64">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-medium text-slate-300">
                Applications
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {stats.total}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-medium text-slate-300">
                Interviews
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {stats.interviews}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="break-words text-sm text-amber-900">{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="shrink-0 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100"
          >
            Refresh data
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <SectionHeading
          title="Your application overview"
          description="A quick look at your current job search progress."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            label="Total applications"
            value={stats.total}
            caption="Jobs you've applied to"
            icon="📨"
            iconStyle="bg-blue-50"
          />
          <StatCard
            label="Shortlisted"
            value={stats.shortlisted}
            caption="Applications progressing"
            icon="✦"
            iconStyle="bg-violet-50"
          />
          <StatCard
            label="Interviews"
            value={stats.interviews}
            caption="Interview-stage applications"
            icon="🗓️"
            iconStyle="bg-amber-50"
          />
          <StatCard
            label="Hired"
            value={stats.hired}
            caption="Successful applications"
            icon="🎉"
            iconStyle="bg-emerald-50"
          />
        </div>
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
        {/* Recent applications */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Recent applications"
            description="Stay up to date with your latest applications."
            action="View all"
            to="/applied"
          />

          {recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((application) => {
                const job = application.job || {};
                const jobId = getId(job);
                const status = application.status || "Applied";

                return (
                  <div
                    key={getId(application)}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-violet-200 hover:bg-violet-50/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg font-extrabold text-violet-700">
                        {(job.company || job.title || "J")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-bold text-slate-900">
                          {job.title || "Job title unavailable"}
                        </p>
                        <p className="mt-1 break-words text-sm text-slate-500">
                          {job.company || "Company unavailable"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Applied{" "}
                          {getDate(
                            application.createdAt || application.updatedAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getStatusStyle(status)}`}
                      >
                        {status}
                      </span>

                      {jobId && (
                        <Link
                          to={`/jobs/${jobId}`}
                          className="text-xs font-bold text-violet-700 hover:text-violet-900"
                        >
                          View job →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="📨"
              title="Your journey starts here"
              description="You haven't applied to any jobs yet. Explore openings and submit your first application."
              action="Explore jobs"
              to="/jobs"
            />
          )}
        </section>

        {/* Profile card */}
        <aside className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-r from-violet-600 to-indigo-600" />

            <div className="px-5 pb-5">
              <div className="-mt-9 flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-violet-100 text-xl font-extrabold text-violet-700 shadow-sm">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile?.name || "U")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>

              <h2 className="mt-3 break-words text-lg font-extrabold text-slate-900">
                {profile?.name || "Complete your profile"}
              </h2>
              <p className="mt-1 break-words text-sm text-slate-500">
                {profile?.email || "Add your email address"}
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Profile status
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      hasProfileDetails
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {hasProfileDetails ? "In progress" : "Incomplete"}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {skills.length > 0
                    ? `${skills.length} skill${skills.length === 1 ? "" : "s"} added to your profile.`
                    : "Add your skills, education and experience to help recruiters understand your strengths."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                    >
                      {typeof skill === "string" ? skill : skill?.name}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/profile"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
              >
                Edit profile <span>→</span>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              ✦
            </div>
            <h3 className="mt-4 font-extrabold text-slate-900">
              Get AI-powered guidance
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Understand your strengths, improve your profile and prepare for
              roles that match your skills.
            </p>

            <div className="mt-4 space-y-2">
              <Link
                to="/ai/profile-analysis"
                className="flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-800 transition hover:bg-violet-100"
              >
                AI profile analysis <span>→</span>
              </Link>
              <Link
                to="/ai/job-match"
                className="flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-800 transition hover:bg-violet-100"
              >
                AI job matching <span>→</span>
              </Link>
              <Link
                to="/ai/career-assistant"
                className="flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-800 transition hover:bg-violet-100"
              >
                Career assistant <span>→</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {/* Latest jobs */}
      <section>
        <SectionHeading
          title="Latest opportunities"
          description="Explore open positions and find your next opportunity."
          action="Browse all jobs"
          to="/jobs"
        />

        {latestJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {latestJobs.map((job) => {
              const jobId = getId(job);

              return (
                <article
                  key={jobId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg font-extrabold text-violet-700">
                      {(job.company || job.title || "J")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold text-slate-900">
                        {job.title || "Untitled position"}
                      </h3>
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {job.company || "Company not specified"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Open
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.location && (
                      <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        ⌖ {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        ◷ {job.employmentType}
                      </span>
                    )}
                    {job.salary && (
                      <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                        ₹ {job.salary}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400">
                      Posted {getDate(job.createdAt)}
                    </span>
                    {jobId && (
                      <Link
                        to={`/jobs/${jobId}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                      >
                        View details <span>→</span>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="💼"
            title="No open jobs right now"
            description="There are no available openings to display. Check back later for new opportunities."
            action="Refresh dashboard"
            to="/jobs"
          />
        )}
      </section>

      {/* Saved jobs quick access */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xl">
            ♡
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">
              Keep your favorite jobs close
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Revisit saved opportunities whenever you're ready to apply.
            </p>
          </div>
        </div>

        <Link
          to="/saved"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          View saved jobs <span>→</span>
        </Link>
      </section>
    </div>
  );
}
