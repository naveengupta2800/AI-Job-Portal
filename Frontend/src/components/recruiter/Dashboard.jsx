import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [summary, setSummary] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  useEffect(() => {
    fetchJobs();
    fetchSummary();

    const interval = setInterval(() => {
      fetchJobs();
      fetchSummary();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // FETCH JOBS
  // =========================
  const fetchJobs = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/jobs/recruiter/all",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobs || []);
        setFilteredJobs(data.jobs || []);
      }
    } catch (err) {
      console.log("Error fetching jobs:", err);
    }
  };

  // =========================
  // FETCH SUMMARY
  // =========================
  const fetchSummary = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/apply/recruiter/dashboard-summary",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSummary(data);
      }
    } catch (err) {
      console.log("Error fetching summary:", err);
    }
  };

  // =========================
  // SEARCH
  // =========================
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();

    setSearchTerm(value);

    let filtered = [...jobs];

    if (value) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(value) ||
          job.company?.toLowerCase().includes(value) ||
          job.location?.toLowerCase().includes(value)
      );
    }

    setFilteredJobs(filtered);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6 lg:p-8">

      {/* =========================
          HEADER
      ========================= */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">
            Recruiter Panel
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-black">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your jobs and track recruitment activity.
          </p>
        </div>

        <div className="min-w-[150px] rounded-xl border text-center border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Total Jobs
          </p>

          <p className="text-xl font-bold text-black">
            {summary.totalJobs}
          </p>
        </div>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Jobs Posted */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Jobs Posted
              </p>

              <h2 className="mt-2 text-3xl font-bold text-black">
                {summary.totalJobs}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-xl text-white">
              ▤
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Total active job listings
          </p>
        </div>

        {/* Applications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Applications
              </p>

              <h2 className="mt-2 text-3xl font-bold text-black">
                {summary.totalApplications}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-xl text-white">
              ◉
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Applications received
          </p>
        </div>

        {/* Shortlisted */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Shortlisted
              </p>

              <h2 className="mt-2 text-3xl font-bold text-black">
                {summary.shortlisted}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-xl text-white">
              ✓
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Candidates shortlisted
          </p>
        </div>

        {/* Hired */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Hired
              </p>

              <h2 className="mt-2 text-3xl font-bold text-black">
                {summary.hired}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-xl text-white">
              ★
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Successfully hired
          </p>
        </div>
      </div>

      {/* =========================
          JOB SECTION HEADER
      ========================= */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-xl font-bold text-black">
            Your Job Listings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage jobs posted by you.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">

          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={handleSearch}
            className="
  min-w-[180px]
  min-h-[40px]
  rounded-xl
  border border-gray-200
  bg-white
  py-3
  pl-9
  pr-2
  text-center
  text-sm
  text-black
  outline-none
  transition
  placeholder:text-gray-400
  focus:border-black
  focus:ring-2
  focus:ring-black/10
"></input>
        </div>
      </div>

      {/* =========================
          JOBS GRID
      ========================= */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="
                group
                rounded-2xl
                border border-gray-200
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-gray-300
                hover:shadow-lg
              "
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-black">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-gray-600">
                    {job.company || "Company not specified"}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  💼
                </div>
              </div>

              {/* Job Info */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                    {job.location || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    Salary
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                    {job.salary || "N/A"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="inline-flex min-h-[30px] min-w-[80px] items-center justify-center rounded-xl bg-[#fbfcfd] px-3 py-1.5 text-center text-xs font-medium text-gray-600">
  Job Listing
</span>
                 
                

                <button
                  type="button"
                  onClick={() => setJobDetails(job)}
                  className="
                    rounded-xl
                    min-w-[120px]
                    min-h-[40px]
                    bg-black
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-gray-800
                    active:scale-95
                  "
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
            🔍
          </div>

          <h3 className="mt-4 text-lg font-bold text-black">
            No jobs found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Try searching with a different job title, company, or location.
          </p>
        </div>
      )}

      {/* =========================
          JOB DETAILS MODAL
      ========================= */}
      {jobDetails && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
          onClick={() => setJobDetails(null)}
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Job Details
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-black">
                    {jobDetails.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {jobDetails.company || "Company not specified"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setJobDetails(null)}
                  className="
                    flex h-9 w-9
                    shrink-0
                    items-center justify-center
                    rounded-lg
                    bg-gray-100
                    text-gray-500
                    transition
                    hover:bg-black
                    hover:text-white
                  "
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">

              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Company
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {jobDetails.company || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {jobDetails.location || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Salary
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {jobDetails.salary || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Experience
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {jobDetails.experience || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-400">
                    Employment Type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {jobDetails.employmentType || "N/A"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="mb-2 text-sm font-bold text-black">
                  Required Skills
                </h3>

                {jobDetails.skillsRequired?.length > 0 ? (
                  <div className=" flex flex-wrap gap-2">
                    {jobDetails.skillsRequired.map((skill, index) => (
                     <span
  key={index}
  className="
    inline-flex
    min-w-[60px]
    min-h-[30px]
    items-center
    justify-center
    rounded-lg
    bg-black
    px-3
    py-1.5
    text-center
    text-xs
    font-medium
    text-white
  "
>
  {skill}
</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No skills specified
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 text-sm font-bold text-black">
                  Job Description
                </h3>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                    {jobDetails.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setJobDetails(null)}
                className="
                min-w-[100px]
                 min-h-[35px]
                  rounded-xl
                  bg-black
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}