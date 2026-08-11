import React, { useEffect, useState } from "react";
import {
  Bookmark,
  Building2,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Trash2,
  ArrowRight,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function SavedJobsPage({ onApply }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState("");

  /* =====================================================
     FETCH SAVED JOBS
  ===================================================== */

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:8000/api/save/saved",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSavedJobs(data.savedJobs || []);
      } else {
        alert(
          data.message || "Failed to fetch saved jobs"
        );
      }
    } catch (err) {
      console.error(err);
      alert("Server error while fetching saved jobs");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REMOVE SAVED JOB
  ===================================================== */

  const handleRemoveJob = async (jobId) => {
    try {
      setRemovingId(jobId);

      const res = await fetch(
        `http://localhost:8000/api/save/unsave/${jobId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message || "Failed to remove saved job"
        );
        return;
      }

      setSavedJobs((prev) =>
        prev.filter((job) => job._id !== jobId)
      );
    } catch (err) {
      console.error(err);
      alert("Server error while removing saved job");
    } finally {
      setRemovingId(null);
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredJobs = savedJobs.filter((job) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      job.title?.toLowerCase().includes(keyword) ||
      job.company?.toLowerCase().includes(keyword) ||
      job.location?.toLowerCase().includes(keyword) ||
      job.employmentType
        ?.toLowerCase()
        .includes(keyword)
    );
  });

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="flex flex-col items-center">

            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-200 border-t-indigo-600">
              <Loader2
                size={20}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading saved jobs...
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="min-h-screen rounded-2xl bg-[#dee4f1]">

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">

        {/* CENTERED CONTENT */}
        <div className="mx-auto w-full max-w-[1350px]">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              {/* LEFT HEADER */}

              <div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                  Job Seeker
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Saved Jobs
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Review the jobs you've saved and apply
                  when you're ready.
                </p>

              </div>

              {/* COUNT */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Bookmark size={19} />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Saved Jobs
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {savedJobs.length}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          {savedJobs.length > 0 && (
            <div className="mb-5 flex flex-col gap-3 border-y border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between">

              {/* SEARCH */}

              <div className=" relative w-full sm:max-w-[360px]">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search saved jobs"
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    pl-10
                    pr-4
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/10
                  "
                />

              </div>

              {/* RESULT COUNT */}

              <div className="flex items-center gap-2 text-sm text-slate-500">

                <SlidersHorizontal size={15} />

                <span>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredJobs.length}
                  </span>{" "}
                  {filteredJobs.length === 1
                    ? "job"
                    : "jobs"}
                </span>

              </div>

            </div>
          )}

          {/* =================================================
              EMPTY / JOB LIST
          ================================================= */}

          {savedJobs.length === 0 ? (

            /* EMPTY SAVED JOBS */

            <div className="border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Bookmark size={25} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No saved jobs
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Jobs that you save will appear here so
                you can easily review and apply to them
                later.
              </p>

            </div>

          ) : filteredJobs.length === 0 ? (

            /* NO SEARCH RESULTS */

            <div className="border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <Search size={22} />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-800">
                No jobs found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try another job title, company, or
                location.
              </p>

            </div>

          ) : (

            /* JOB LIST */

            <div className="space-y-3">

              {filteredJobs.map((job) => (

                <article
                  key={job._id}
                  className=" rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    duration-200
                    hover:border-slate-300
                    hover:shadow-md
                  "
                >

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* =================================================
                          JOB INFORMATION
                      ================================================= */}

                      <div className="flex min-w-0 items-start gap-4">

                        {/* COMPANY ICON */}

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            text-indigo-600
                          "
                        >
                          <Building2 size={21} />
                        </div>

                        {/* JOB DETAILS */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                              {job.title ||
                                "Untitled Job"}
                            </h2>

                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">

                              <Bookmark
                                size={10}
                                fill="currentColor"
                              />

                              Saved

                            </span>

                          </div>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {job.company ||
                              "Company not specified"}
                          </p>

                          {/* JOB META */}

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">

                            {/* LOCATION */}

                            <span className="flex items-center gap-1.5 text-xs text-slate-500">

                              <MapPin
                                size={14}
                                className="text-slate-400"
                              />

                              {job.location ||
                                "Location not specified"}

                            </span>

                            {/* JOB TYPE */}

                            <span className="flex items-center gap-1.5 text-xs text-slate-500">

                              <BriefcaseBusiness
                                size={14}
                                className="text-slate-400"
                              />

                              {job.employmentType ||
                                "Job type not specified"}

                            </span>

                            {/* POSTED DATE */}

                            <span className="flex items-center gap-1.5 text-xs text-slate-500">

                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />

                              Posted{" "}
                              {formatDate(
                                job.createdAt
                              )}

                            </span>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-4 lg:border-0 lg:pt-0">

                        {/* APPLY */}

                        {onApply && (
                          <button
                            type="button"
                            onClick={() =>
                              onApply(job)
                            }
                            className="
                              inline-flex
                              h-10
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              bg-indigo-600
                              px-4
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-indigo-700
                              focus:outline-none
                              focus:ring-2
                              focus:ring-indigo-500/20
                            "
                          >
                            Apply Now
                            <ArrowRight size={15} />
                          </button>
                        )}

                        {/* REMOVE */}

                        <button
                          type="button"
                          disabled={
                            removingId === job._id
                          }
                          onClick={() =>
                            handleRemoveJob(
                              job._id
                            )
                          }
                          className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            px-4
                            text-sm
                            font-semibold
                            text-slate-600
                            transition
                            hover:border-red-200
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >

                          {removingId === job._id ? (
                            <>
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                              Removing
                            </>
                          ) : (
                            <>
                              <Trash2 size={15} />
                              Remove
                            </>
                          )}

                        </button>

                      </div>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

