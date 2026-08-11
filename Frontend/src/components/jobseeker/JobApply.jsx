import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  ChevronDown,
  XCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function JobApply() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* =====================================================
     FETCH APPLICATIONS
  ===================================================== */

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/apply/me${
          statusFilter
            ? `?status=${encodeURIComponent(statusFilter)}`
            : ""
        }`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch applications"
        );
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err.message ||
          "Server error while fetching applications"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     WITHDRAW APPLICATION
  ===================================================== */

  const withdrawApplication = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this application?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/apply/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Unable to withdraw application"
        );
      }

      setApplications((prev) =>
        prev.filter(
          (application) =>
            application._id !== id
        )
      );
    } catch (err) {
      alert(
        err.message ||
          "Error withdrawing application"
      );
    }
  };

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return {
          wrapper:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: <CheckCircle2 size={13} />,
        };

      case "under review":
        return {
          wrapper:
            "border-amber-200 bg-amber-50 text-amber-700",
          icon: <Clock3 size={13} />,
        };

      case "shortlisted":
        return {
          wrapper:
            "border-violet-200 bg-violet-50 text-violet-700",
          icon: <CheckCircle2 size={13} />,
        };

      case "interview":
        return {
          wrapper:
            "border-indigo-200 bg-indigo-50 text-indigo-700",
          icon: <Video size={13} />,
        };

      case "rejected":
        return {
          wrapper:
            "border-red-200 bg-red-50 text-red-700",
          icon: <XCircle size={13} />,
        };

      case "hired":
        return {
          wrapper:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: <CheckCircle2 size={13} />,
        };

      default:
        return {
          wrapper:
            "border-slate-200 bg-slate-50 text-slate-600",
          icon: <BriefcaseBusiness size={13} />,
        };
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[65vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600 shadow-sm">
              <Loader2
                size={20}
                className="animate-spin"
              />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading applications...
            </p>

          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="mx-auto flex min-h-[65vh] max-w-[550px] items-center justify-center px-5">

          <div className="w-full rounded-xl border border-red-200 bg-white p-7 text-center shadow-sm">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <AlertCircle size={21} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              Unable to load applications
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchApplications}
              className="
                mt-5
                inline-flex
                h-9
                items-center
                justify-center
                rounded-lg
                bg-indigo-600
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-indigo-700
              "
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen rounded-2xl bg-[#dee4f1]">

      <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">

              <BriefcaseBusiness size={14} />

              Application Tracker

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Applications
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Track the progress of your job applications.
            </p>

          </div>

          {/* FILTER */}

          <div className="relative">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="
                h-10
                min-w-[175px]
                appearance-none
                rounded-lg
                border
                border-slate-300
                 bg-[#dee4f1]
                px-3.5
                pr-9
                text-sm
                font-medium
                text-slate-700
                shadow-sm
                outline-none
                transition
                hover:border-slate-400
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/10
              "
            >
              <option value="">
                All Status
              </option>

              <option value="Applied">
                Applied
              </option>

              <option value="Under Review">
                Under Review
              </option>

              <option value="Shortlisted">
                Shortlisted
              </option>

              <option value="Interview">
                Interview
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Hired">
                Hired
              </option>

            </select>

            <ChevronDown
              size={15}
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

          </div>

        </div>

        {/* =================================================
            COUNT BAR
        ================================================= */}

        <div className="mb-4 flex items-center justify-between">

          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {applications.length}
            </span>{" "}
            {applications.length === 1
              ? "application"
              : "applications"}
          </p>

          {statusFilter && (
            <button
              type="button"
              onClick={() =>
                setStatusFilter("")
              }
              className="
                text-xs
                font-semibold
                text-indigo-600
                transition
                hover:text-indigo-800
              "
            >
              Clear filter
            </button>
          )}

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {applications.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <BriefcaseBusiness size={23} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No applications found
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
              {statusFilter
                ? `You don't have any applications with the "${statusFilter}" status.`
                : "You haven't applied to any jobs yet."}
            </p>

            {statusFilter && (
              <button
                type="button"
                onClick={() =>
                  setStatusFilter("")
                }
                className="
                  mt-4
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-indigo-600
                  px-4
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-indigo-700
                "
              >
                View All Applications
              </button>
            )}

          </div>

        ) : (

          /* =================================================
             APPLICATION LIST
          ================================================= */

          <div className="space-y-4">

            {applications.map((app) => {

              const statusStyle =
                getStatusStyle(
                  app.status
                );

              const canWithdraw =
                app.status !==
                  "Interview" &&
                app.status !== "Hired";

              return (

                <article
                  key={app._id}
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    hover:border-slate-300
                    hover:shadow-md
                  "
                >

                  {/* =================================================
                      JOB HEADER
                  ================================================= */}

                  <div className="px-5 py-4 sm:px-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex min-w-0 items-center gap-3">

                        {/* COMPANY ICON */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">

                          <Building2 size={19} />

                        </div>

                        {/* JOB INFO */}

                        <div className="min-w-0">

                          <h2 className="truncate text-base font-bold text-slate-900">
                            {app.job?.title ||
                              "Job deleted"}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                            <span className="inline-flex items-center gap-1">
                              <Building2
                                size={12}
                              />
                              {app.job?.company ||
                                "N/A"}
                            </span>

                            {app.job?.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin
                                  size={12}
                                />
                                {app.job.location}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`
                          inline-flex
                          w-fit
                          shrink-0
                          items-center
                          gap-1.5
                          rounded-md
                          border
                          px-2.5
                          py-1.5
                          text-xs
                          font-semibold
                          ${statusStyle.wrapper}
                        `}
                      >
                        {statusStyle.icon}

                        {app.status ||
                          "N/A"}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      MAIN DETAILS
                  ================================================= */}

                  <div className="border-t border-slate-100 px-5 py-4 sm:px-6">

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.15fr]">

                      {/* =================================================
                          APPLICATION TIMELINE
                      ================================================= */}

                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">

                        <div className="mb-4 flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-indigo-600 shadow-sm">
                            <Clock3 size={15} />
                          </div>

                          <div>

                            <h3 className="text-sm font-bold text-slate-800">
                              Application Timeline
                            </h3>

                            <p className="text-[11px] text-slate-400">
                              Status history
                            </p>

                          </div>

                        </div>

                        {app.timeline?.length ? (

                          <div className="space-y-3">

                            {app.timeline.map(
                              (
                                timelineItem,
                                index
                              ) => (

                                <div
                                  key={index}
                                  className="flex gap-3"
                                >

                                  <div className="flex flex-col items-center">

                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                                    {index !==
                                      app.timeline.length -
                                        1 && (
                                      <span className="mt-1 h-full w-px bg-slate-200" />
                                    )}

                                  </div>

                                  <div className="min-w-0 pb-1">

                                    <p className="text-xs font-semibold text-slate-700">
                                      {
                                        timelineItem.status
                                      }
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      {timelineItem.date
                                        ? new Date(
                                            timelineItem.date
                                          ).toLocaleDateString(
                                            "en-IN",
                                            {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            }
                                          )
                                        : "N/A"}
                                    </p>

                                  </div>

                                </div>

                              )
                            )}

                          </div>

                        ) : (

                          <p className="text-xs text-slate-400">
                            No timeline updates yet.
                          </p>

                        )}

                      </div>

                      {/* =================================================
                          INTERVIEW DETAILS
                      ================================================= */}

                      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">

                        <div className="mb-4 flex items-center justify-between gap-3">

                          <div className="flex items-center gap-2.5">

                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
                              <Video size={15} />
                            </div>

                            <div>

                              <h3 className="text-sm font-bold text-slate-800">
                                Interview Details
                              </h3>

                              <p className="text-[11px] text-slate-400">
                                Scheduled interview information
                              </p>

                            </div>

                          </div>

                          {app.interview?.date && (
                            <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 sm:block">
                              SCHEDULED
                            </span>
                          )}

                        </div>

                        {app.interview?.date ? (

                          <div className="grid grid-cols-2 gap-2.5">

                            {/* DATE */}

                            <InterviewItem
                              icon={
                                <CalendarDays
                                  size={15}
                                />
                              }
                              label="Date"
                              value={new Date(
                                app.interview.date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                              iconClass="bg-indigo-50 text-indigo-600"
                            />

                            {/* TIME */}

                            <InterviewItem
                              icon={
                                <Clock3
                                  size={15}
                                />
                              }
                              label="Time"
                              value={
                                app.interview
                                  .time ||
                                "Not specified"
                              }
                              iconClass="bg-blue-50 text-blue-600"
                            />

                            {/* LOCATION */}

                            <InterviewItem
                              icon={
                                <MapPin
                                  size={15}
                                />
                              }
                              label="Location"
                              value={
                                app.interview
                                  .location ||
                                "Not specified"
                              }
                              iconClass="bg-rose-50 text-rose-600"
                            />

                            {/* MODE */}

                            <InterviewItem
                              icon={
                                <Video
                                  size={15}
                                />
                              }
                              label="Mode"
                              value={
                                app.interview
                                  .mode ||
                                "Not specified"
                              }
                              iconClass="bg-emerald-50 text-emerald-600"
                            />

                          </div>

                        ) : (

                          <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-white/60 px-4 text-center">

                            <CalendarDays
                              size={20}
                              className="text-slate-300"
                            />

                            <p className="mt-2 text-xs font-semibold text-slate-600">
                              Interview not scheduled
                            </p>

                            <p className="mt-1 max-w-xs text-[11px] leading-4 text-slate-400">
                              Interview details will
                              appear here once the
                              recruiter schedules
                              your interview.
                            </p>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      ACTION FOOTER
                  ================================================= */}

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <p className="text-[10px] text-slate-400">

                      Application ID:{" "}

                      <span className="font-mono text-slate-500">
                        {app._id}
                      </span>

                    </p>

                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() =>
                          withdrawApplication(
                            app._id
                          )
                        }
                        className="
                          inline-flex
                          h-8
                          items-center
                          justify-center
                          gap-1.5
                          rounded-md
                          border
                          border-red-200
                          bg-white
                          px-3
                          text-xs
                          font-semibold
                          text-red-600
                          transition
                          hover:border-red-300
                          hover:bg-red-50
                        "
                      >
                        <XCircle size={13} />
                        Withdraw
                      </button>
                    )}

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

/* =========================================================
   INTERVIEW ITEM
========================================================= */

function InterviewItem({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-md border border-white bg-white p-3 shadow-sm">

      <div className="flex items-start gap-2.5">

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-bold leading-4 text-slate-700">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

