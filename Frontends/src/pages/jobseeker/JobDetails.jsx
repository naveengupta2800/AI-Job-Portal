
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Send,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";

import api from "../../services/api";
import { useAuth } from "/../context/AuthContext";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchJob() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/jobs/${jobId}`);

        if (active) {
          setJob(response.data.job);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load this job."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchJob();

    return () => {
      active = false;
    };
  }, [jobId]);

  useEffect(() => {
    let active = true;

    async function checkSavedStatus() {
      if (userRole !== "jobseeker" || !jobId) {
        setSaved(false);
        return;
      }

      try {
        const response = await api.get("/save/saved");
        const savedJobs = response.data.savedJobs || [];

        if (active) {
          setSaved(
            savedJobs.some(
              (item) => String(item._id) === String(jobId)
            )
          );
        }
      } catch {
        if (active) setSaved(false);
      }
    }

    checkSavedStatus();

    return () => {
      active = false;
    };
  }, [jobId, userRole]);

  const handleSave = async () => {
    if (!userRole) {
      toast.info("Please sign in to save this job.");
      navigate("/login", { state: { from: `/jobs/${jobId}` } });
      return;
    }

    if (userRole !== "jobseeker") {
      toast.info("Only job seekers can save jobs.");
      return;
    }

    try {
      setSaving(true);

      if (saved) {
        await api.post(`/save/unsave/${jobId}`);
        setSaved(false);
        toast.success("Job removed from saved jobs.");
      } else {
        await api.post(`/save/save/${jobId}`);
        setSaved(true);
        toast.success("Job saved successfully.");
      }
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to update saved jobs."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!userRole) {
      toast.info("Please sign in to apply for this job.");
      navigate("/login", { state: { from: `/jobs/${jobId}` } });
      return;
    }

    if (userRole !== "jobseeker") {
      toast.info("Recruiters cannot apply for jobs.");
      return;
    }

    if (job?.status === "closed") {
      toast.error("This job is no longer accepting applications.");
      return;
    }

    try {
      setApplying(true);

      const response = await api.post(`/apply/${jobId}`);

      toast.success(
        response.data.message || "Application submitted successfully!"
      );

      navigate("/jobseeker/applications");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to apply. Please try again."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading job details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <BriefcaseBusiness className="mx-auto text-violet-600" size={36} />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
            Job not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error || "This job may have been removed."}
          </p>
          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
          >
            <ArrowLeft size={17} />
            Back to jobs
          </Link>
        </div>
      </main>
    );
  }

  const responsibilities = Array.isArray(job.responsibility)
    ? job.responsibility
    : [];

  const skills = Array.isArray(job.skillsRequired)
    ? job.skillsRequired
    : [];

  const recruiterName =
    typeof job.recruiterId === "object"
      ? job.recruiterId?.name
      : null;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
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

          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-200 hover:text-violet-700"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">All jobs</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* Main job heading */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-start">
            <div className="flex min-w-0 gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 sm:h-16 sm:w-16">
                <Building2 size={28} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-violet-600">
                  Career opportunity
                </p>

                <h1 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  {job.title || "Untitled position"}
                </h1>

                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Building2 size={16} />
                    {job.company || "Company not specified"}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {job.location || "Location not specified"}
                  </span>
                </p>

                {recruiterName && (
                  <p className="mt-2 text-sm text-slate-500">
                    Posted by {recruiterName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:min-w-[220px] lg:flex-col">
              <button
                type="button"
                onClick={handleApply}
                disabled={applying || job.status === "closed"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200/60 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={17} />
                {job.status === "closed"
                  ? "Applications closed"
                  : applying
                    ? "Applying..."
                    : "Apply now"}
              </button>

              {userRole === "jobseeker" && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
                >
                  <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                  {saving ? "Saving..." : saved ? "Saved" : "Save job"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            {job.employmentType && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-2.5 text-sm font-semibold text-violet-700">
                <BriefcaseBusiness size={16} />
                {job.employmentType}
              </span>
            )}

            {job.experience && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-700">
                <Clock3 size={16} />
                {job.experience}
              </span>
            )}

            {job.salary && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
                <Wallet size={16} />
                {job.salary}
              </span>
            )}

            {job.closeDate && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-700">
                <CalendarDays size={16} />
                Apply before{" "}
                {new Date(job.closeDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </section>

        {/* Description and sidebar */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-slate-900">
                About the role
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 sm:text-base">
                {job.description || "No description has been provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-slate-900">
                Responsibilities
              </h2>

              {responsibilities.length > 0 ? (
                <ul className="mt-5 space-y-4">
                  {responsibilities.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 text-sm leading-7 text-slate-600"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-emerald-600"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Responsibilities have not been specified for this role.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Sparkles size={20} />
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Skills required
                </h2>
              </div>

              {skills.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No specific skills have been listed.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-900">
                Job overview
              </h2>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Location
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {job.location || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BriefcaseBusiness size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Employment type
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {job.employmentType || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Wallet size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Salary
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {job.salary || "Not disclosed"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <CalendarDays size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Date posted
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={applying || job.status === "closed"}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {applying ? "Applying..." : "Apply for this job"}
                <Send size={16} />
              </button>
            </section>

            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <Sparkles size={21} className="text-violet-600" />
              <h3 className="mt-3 font-bold text-slate-900">
                Ready for your next step?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep your profile and resume updated before applying.
              </p>
              <Link
                to="/jobseeker/profile"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:text-violet-900"
              >
                View profile <ArrowLeft className="rotate-180" size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
