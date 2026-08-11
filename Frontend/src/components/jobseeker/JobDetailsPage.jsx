import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Building2,
  BriefcaseBusiness,
  IndianRupee,
  Clock3,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Send,
  FileText,
  Users,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";

import "./JobDetailsPage.css";
import AIJobMatch from "./AIJobMatch";

export default function JobDetailsPage({
  savedJobIds = [],
  onToggleSave,
}) {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // =====================================================
  // FETCH JOB
  // =====================================================

  useEffect(() => {
    if (id) {
      fetchJob();
      checkAlreadyApplied();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:8000/api/jobs/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setJob(data.job);
      } else {
        setError(
          data.message || "Failed to fetch job"
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Server error while fetching job"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHECK APPLICATION
  // =====================================================

  const checkAlreadyApplied = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/apply/me",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok && data.applications) {
        const appliedJob =
          data.applications.find(
            (app) =>
              app.job?._id === id
          );

        if (appliedJob) {
          setApplied(true);
        }
      }
    } catch (err) {
      console.error(
        "Error checking applied jobs:",
        err
      );
    }
  };

  // =====================================================
  // APPLY
  // =====================================================

  const handleApply = async (jobId) => {
    if (!jobId || applied || applying) {
      return;
    }

    setApplying(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/apply/${jobId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message || "Apply failed"
        );
        return;
      }

      setApplied(true);

      alert("Applied successfully!");
    } catch (err) {
      console.error(err);

      alert(
        "Server error while applying"
      );
    } finally {
      setApplying(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dee4f1] px-4 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-[1100px] items-center justify-center">
          <div className="flex flex-col items-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2
                size={23}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading job details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#dee4f1] px-4 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-[650px] items-center justify-center">

          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load job
            </h2>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchJob}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#dee4f1] flex items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Job not found.
        </p>
      </div>
    );
  }

  // =====================================================
  // VALUES
  // =====================================================

  const isSaved = savedJobIds
    .map(String)
    .includes(
      job?._id?.toString()
    );

  const skills =
    job?.skillsRequired || [];

  const responsibilities =
    job?.responsibility || [];

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#dee4f1] px-4 py-7 sm:px-6 lg:px-8">

      <main className="mx-auto w-full max-w-[1180px]">

        {/* =================================================
            TOP JOB HEADER
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="p-5 sm:p-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              {/* LEFT */}

              <div className="flex min-w-0 gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BriefcaseBusiness
                    size={25}
                  />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {job?.title ||
                        "Job Title"}
                    </h1>

                    {applied && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2
                          size={13}
                        />
                        Applied
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

                    <span className="inline-flex items-center gap-1.5">
                      <Building2
                        size={15}
                        className="text-indigo-500"
                      />
                      {job?.company ||
                        "Company not specified"}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin
                        size={15}
                        className="text-indigo-500"
                      />
                      {job?.location ||
                        "Location not specified"}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness
                        size={15}
                        className="text-indigo-500"
                      />
                      {job?.employmentType ||
                        "Not specified"}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Job ID:{" "}
                    <span className="font-medium text-slate-500">
                      {job?._id || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    onToggleSave?.(
                      job?._id
                    )
                  }
                  className={`
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    px-5
                    text-sm
                    font-semibold
                    transition
                    ${
                      isSaved
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                    }
                  `}
                >
                  {isSaved ? (
                    <BookmarkCheck
                      size={16}
                    />
                  ) : (
                    <Bookmark
                      size={16}
                    />
                  )}

                  {isSaved
                    ? "Saved"
                    : "Save Job"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApply(
                      job?._id
                    )
                  }
                  disabled={
                    applying || applied
                  }
                  className={`
                    inline-flex
                    h-10
                    min-w-[130px]
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    ${
                      applied
                        ? "cursor-default bg-emerald-600"
                        : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                    }
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  `}
                >
                  {applied ? (
                    <>
                      <CheckCircle2
                        size={16}
                      />
                      Applied
                    </>
                  ) : applying ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Send
                        size={16}
                      />
                      Apply Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              QUICK INFO
          ================================================= */}

          <div className="grid grid-cols-2 border-t border-slate-100 sm:grid-cols-4">

            <QuickInfo
              icon={
                <IndianRupee
                  size={17}
                />
              }
              label="Salary"
              value={
                job?.salary || "Not specified"
              }
            />

            <QuickInfo
              icon={
                <BriefcaseBusiness
                  size={17}
                />
              }
              label="Experience"
              value={
                job?.experience ||
                "Not specified"
              }
            />

            <QuickInfo
              icon={
                <Clock3 size={17} />
              }
              label="Employment"
              value={
                job?.employmentType ||
                "Not specified"
              }
            />

            <QuickInfo
              icon={
                <CalendarDays
                  size={17}
                />
              }
              label="Posted"
              value={
                job?.createdAt
                  ? new Date(
                      job.createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "Recently"
              }
            />
          </div>
        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="space-y-5">

            {/* DESCRIPTION */}

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <FileText size={17} />
                }
                title="Job Description"
              />

              <div className="p-5 sm:p-6">

                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {job?.description ||
                    "No job description provided."}
                </p>
              </div>
            </section>

            {/* SKILLS */}

            {skills.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <TargetIcon />
                  }
                  title="Skills Required"
                />

                <div className="p-5 sm:p-6">

                  <div className="flex flex-wrap gap-2">

                    {skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* RESPONSIBILITIES */}

            {responsibilities.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <Users size={17} />
                  }
                  title="Responsibilities"
                />

                <div className="p-5 sm:p-6">

                  <div className="space-y-3">

                    {responsibilities.map(
                      (
                        responsibility,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex gap-3"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                          <p className="text-sm leading-6 text-slate-600">
                            {responsibility}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* BOTTOM APPLY */}

            <section className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Interested in this position?
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Apply now and take the next step in your career.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleApply(
                      job?._id
                    )
                  }
                  disabled={
                    applying || applied
                  }
                  className={`
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    ${
                      applied
                        ? "bg-emerald-600"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }
                  `}
                >
                  {applied ? (
                    <>
                      <CheckCircle2
                        size={16}
                      />
                      Application Submitted
                    </>
                  ) : applying ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Apply Now
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">

            {/* AI JOB MATCH */}

            <AIJobMatch job={job} />

            {/* JOB OVERVIEW */}

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <BriefcaseBusiness
                    size={17}
                  />
                }
                title="Job Overview"
              />

              <div className="divide-y divide-slate-100">

                <OverviewItem
                  icon={
                    <Building2 size={16} />
                  }
                  label="Company"
                  value={
                    job?.company ||
                    "Not specified"
                  }
                />

                <OverviewItem
                  icon={
                    <MapPin size={16} />
                  }
                  label="Location"
                  value={
                    job?.location ||
                    "Not specified"
                  }
                />

                <OverviewItem
                  icon={
                    <BriefcaseBusiness
                      size={16}
                    />
                  }
                  label="Experience"
                  value={
                    job?.experience ||
                    "Not specified"
                  }
                />

                <OverviewItem
                  icon={
                    <Clock3 size={16} />
                  }
                  label="Job Type"
                  value={
                    job?.employmentType ||
                    "Not specified"
                  }
                />

                <OverviewItem
                  icon={
                    <IndianRupee size={16} />
                  }
                  label="Salary"
                  value={
                    job?.salary ||
                    "Not specified"
                  }
                />
              </div>
            </section>

            {/* SAVE CARD */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  {isSaved ? (
                    <BookmarkCheck
                      size={17}
                    />
                  ) : (
                    <Bookmark
                      size={17}
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {isSaved
                      ? "Job saved"
                      : "Save this job"}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {isSaved
                      ? "You can find this job in your saved jobs."
                      : "Save this job to review and apply later."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onToggleSave?.(
                    job?._id
                  )
                }
                className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck
                      size={14}
                    />
                    Remove from Saved
                  </>
                ) : (
                  <>
                    <Bookmark
                      size={14}
                    />
                    Save Job
                  </>
                )}
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  icon,
  title,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <h2 className="text-sm font-bold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

// =========================================================
// QUICK INFO
// =========================================================

function QuickInfo({
  icon,
  label,
  value,
}) {
  return (
    <div className="border-r border-slate-100 px-4 py-4 last:border-r-0 sm:px-5">

      <div className="flex items-center gap-2">

        <div className="text-indigo-500">
          {icon}
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1.5 truncate text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// OVERVIEW ITEM
// =========================================================

function OverviewItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// TARGET ICON
// =========================================================

function TargetIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}