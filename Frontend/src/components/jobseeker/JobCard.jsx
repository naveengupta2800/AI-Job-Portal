import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  MapPin,
  IndianRupee,
  ArrowUpRight,
  BookmarkCheck,
} from "lucide-react";

export default function JobCard({ job, isSaved, onToggleSave }) {
  const navigate = useNavigate();

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  /* =====================================================
     FORMAT EXPERIENCE
  ===================================================== */

  const formatExperience = (experience) => {
    if (
      experience === null ||
      experience === undefined ||
      experience === ""
    ) {
      return null;
    }

    const value = String(experience).trim();

    // If backend already sends:
    // "1 Year", "2 Years", "1 Month", "6 Months"
    // then keep it as it is.
    if (/(year|years|month|months)/i.test(value)) {
      return value;
    }

    // Numeric value => Years
    if (!isNaN(value)) {
      const number = Number(value);

      return `${number} ${
        number === 1 ? "Year" : "Years"
      }`;
    }

    // Anything else
    return value;
  };

  /* =====================================================
     CHECK WHETHER ALREADY APPLIED
  ===================================================== */

  useEffect(() => {
    if (job?._id) {
      checkAlreadyApplied();
    }
  }, [job?._id]);

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
        const appliedJob = data.applications.find(
          (app) => app.job?._id === job?._id
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

  /* =====================================================
     APPLY JOB
  ===================================================== */

  const handleApply = async (jobId) => {
    if (!jobId || applying || applied) return;

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
        alert(data.message || "Apply failed");
        return;
      }

      setApplied(true);

      alert("✅ Applied successfully");
    } catch (err) {
      console.error(err);
      alert("Server error while applying");
    } finally {
      setApplying(false);
    }
  };

  /* =====================================================
     VIEW JOB DETAILS
  ===================================================== */

  const handleViewJob = () => {
    if (job?._id) {
      navigate(`/job/${job._id}`);
    }
  };

  /* =====================================================
     CARD
  ===================================================== */

  return (
    <article
  className="
    group
    relative
    flex
    w-100
    h-130
    min-h-90
    flex-col
    overflow-hidden
    rounded-2xl
    border
    border-slate-200

    bg-white
    shadow-[0_20px_45px_rgba(37,99,205,0.30)]
    transition-all
    duration-300
    hover:-translate-y-1.5
    hover:border-blue-200
    hover:shadow-[0_20px_45px_rgba(37,99,235,0.30)]
  "
>

      {/* =================================================
          TOP ACCENT
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          right-0
          top-0
          h-1
          bg-linear-to-r
          from-indigo-500
          via-blue-500
          to-cyan-400
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      {/* =================================================
          CARD HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4 p-4 pb-2">

        {/* COMPANY */}

        <div className="flex min-w-0 items-center gap-3">

          {/* Company Icon */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-indigo-100
              bg-linear-to-br
              from-indigo-50
              to-blue-50
              text-indigo-600
              transition-transform
              duration-300
              group-hover:scale-105
            "
          >
            <Building2 size={18} />
          </div>

          {/* Company Details */}

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-800">
              {job?.company || "Company"}
            </p>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

              <MapPin
                size={13}
                className="shrink-0"
              />

              <span className="truncate">
                {job?.location ||
                  "Location not specified"}
              </span>

            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(job?._id);
          }}
          aria-label={
            isSaved
              ? "Remove saved job"
              : "Save job"
          }
          title={
            isSaved
              ? "Remove from saved jobs"
              : "Save job"
          }
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            transition-all
            duration-200
            ${
              isSaved
                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                : "border-slate-200 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            }
          `}
        >
          {isSaved ? (
            <BookmarkCheck size={18} />
          ) : (
            <Bookmark size={18} />
          )}
        </button>

      </div>

      {/* =================================================
          JOB CONTENT
      ================================================= */}

      <div className="flex flex-1 flex-col px-4 pb-4">

        {/* =================================================
            JOB TITLE
        ================================================= */}

        <button
          type="button"
          onClick={handleViewJob}
          className="
            group/title
            mt-0
            w-fit
            max-w-full
            text-left
          "
          title="View job details"
        >
          <h3
            className="
              line-clamp-2
              text-base
              font-bold
              leading-5
              text-slate-900
              underline-offset-4
              transition-all
              duration-200
              group-hover/title:text-indigo-600
              group-hover/title:underline
            "
          >
            {job?.title || "Untitled Position"}
          </h3>
        </button>

        {/* Small helper text */}

        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Click title to view details
        </p>

        {/* =================================================
            JOB META
        ================================================= */}

       <div className="mt-2 flex flex-wrap items-center gap-1.5">

          {/* Employment Type */}

          {job?.employmentType && (
           <span
  className="
    inline-flex
    min-h-9
    items-center
    justify-center
    gap-2
    whitespace-nowrap
    rounded-xl
    border
    border-indigo-200
    bg-linear-to-r
    from-indigo-50
    to-blue-50
    px-4
    py-2
    text-sm
    font-semibold
    leading-none
    text-indigo-700
    shadow-sm
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:border-indigo-300
    hover:bg-indigo-100
    hover:shadow-md
  "
>
  <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
  <span className="whitespace-nowrap">
    {job.employmentType}
  </span>
</span>
          )}

          {/* Experience */}

          {formatExperience(job?.experience) && (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-2.5
                py-1
                text-xs
                font-medium
                text-slate-600
              "
            >
              <Clock3 size={12} />

              {formatExperience(job.experience)}
            </span>
          )}

          {/* Remote */}

          {job?.isRemote && (
            <span
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-2.5
                py-2
                text-xs
                font-semibold
                text-emerald-700
              "
            >
              Remote
            </span>
          )}

        </div>

        {/* =================================================
            SALARY
        ================================================= */}

        {job?.salary && (
         <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-amber-50
                text-amber-600
              "
            >
              <IndianRupee size={14} />
            </div>

            <span>
              {job.salary}
            </span>

          </div>
        )}

        {/* =================================================
            SPACER
        ================================================= */}

        <div className="flex-1" />

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="my-4 h-px bg-slate-100" />

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex items-center gap-2">

          {/* APPLY */}

          <button
            type="button"
            onClick={() =>
              handleApply(job?._id)
            }
            disabled={
              applying || applied
            }
            className={`
              inline-flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              transition-all
              duration-200
              ${
                applied
                  ? "cursor-not-allowed bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : applying
                  ? "cursor-wait bg-indigo-400 text-white"
                  : "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
              }
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
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                />

                Applying...
              </>
            ) : (
              <>
                Apply Now

                <ArrowUpRight
                  size={16}
                />
              </>
            )}

          </button>

          {/* VIEW DETAILS */}

          <button
            type="button"
            onClick={handleViewJob}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              transition-all
              duration-200
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-600
            "
            title="View job details"
            aria-label="View job details"
          >
            <ArrowUpRight size={18} />
          </button>

        </div>

      </div>
    </article>
  );
}

