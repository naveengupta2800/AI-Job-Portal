import React, { useEffect, useMemo, useState } from "react";

export default function MyJobListings() {
  const [jobs, setJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    location: "",
    postedOn: "",
    lastDate: "",
    closeDate: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    fetch("http://localhost:8000/api/jobs/recruiter/all", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch((err) => console.log(err));
  }, []);

  /* ================= DELETE JOB ================= */
  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/jobs/delete/${jobId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Unable to delete job");
      }

      setJobs((prev) => prev.filter((job) => job._id !== jobId));

      if (jobDetails?._id === jobId) {
        setJobDetails(null);
      }

      alert("Job deleted successfully!");
    } catch (err) {
      console.log(err);
      alert("Server error while deleting job");
    }
  };

  /* ================= VIEW DETAILS ================= */
  const viewJobDetails = (job) => {
    setJobDetails(job);
  };

  /* ================= FILTER ================= */
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const today = new Date();

      /* Employment Type */
      if (
        filters.type &&
        job.employmentType !== filters.type
      ) {
        return false;
      }

      /* Location */
      if (
        filters.location &&
        job.location !== filters.location
      ) {
        return false;
      }

      /* Posted On */
      if (filters.postedOn && job.createdAt) {
        const postedDate = new Date(job.createdAt);

        const diffDays =
          (today - postedDate) /
          (1000 * 60 * 60 * 24);

        if (diffDays > Number(filters.postedOn)) {
          return false;
        }
      }

      /* Last Date */
      if (filters.lastDate && job.lastDate) {
        const last = new Date(job.lastDate);

        if (
          filters.lastDate === "expired" &&
          last >= today
        ) {
          return false;
        }

        if (
          filters.lastDate === "upcoming" &&
          last < today
        ) {
          return false;
        }
      }

      /* Close Date / Status */
      if (filters.closeDate) {
        if (
          filters.closeDate === "open" &&
          job.status === "Closed"
        ) {
          return false;
        }

        if (
          filters.closeDate === "closed" &&
          job.status !== "Closed"
        ) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, filters]);

  /* ================= SORT ================= */
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (!sortConfig.key) {
        return 0;
      }

      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (
        ["createdAt", "lastDate", "closeDate"].includes(
          sortConfig.key
        )
      ) {
        valA = valA
          ? new Date(valA).getTime()
          : 0;

        valB = valB
          ? new Date(valB).getTime()
          : 0;
      }

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
      }

      if (typeof valB === "string") {
        valB = valB.toLowerCase();
      }

      if (valA < valB) {
        return sortConfig.direction === "asc"
          ? -1
          : 1;
      }

      if (valA > valB) {
        return sortConfig.direction === "asc"
          ? 1
          : -1;
      }

      return 0;
    });
  }, [filteredJobs, sortConfig]);

  /* ================= SORT HANDLER ================= */
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  /* ================= SORT ICON ================= */
  const sortIcon = (key) => {
    if (sortConfig.key !== key) {
      return "↕";
    }

    return sortConfig.direction === "asc"
      ? "↑"
      : "↓";
  };

  /* ================= RESET FILTERS ================= */
  const resetFilters = () => {
    setFilters({
      type: "",
      location: "",
      postedOn: "",
      lastDate: "",
      closeDate: "",
    });

    setSortConfig({
      key: "",
      direction: "asc",
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-5 md:p-7 lg:p-8">

      {/* ================= HEADER ================= */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          My Job Listings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage, filter and review all jobs posted by you.
        </p>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div
        className={`grid gap-5 ${
          jobDetails
            ? "xl:grid-cols-[minmax(0,1fr)_390px]"
            : "grid-cols-1"
        }`}
      >

        {/* ================= LEFT TABLE ================= */}
        <div className="min-w-0">

          {/* ================= FILTER BAR ================= */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4">

              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-base font-bold text-black">
                    Job Listings
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {sortedJobs.length} job
                    {sortedJobs.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    self-start
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-gray-600
                    transition
                    hover:border-black
                    hover:bg-black
                    hover:text-white
                  "
                >
                  Reset Filters
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {/* Type */}
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type: e.target.value,
                    })
                  }
                  className="
                    h-11
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-700
                    outline-none
                    focus:border-black
                    focus:ring-2
                    focus:ring-black/10
                  "
                >
                  <option value="">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>

                {/* Location */}
                <select
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      location: e.target.value,
                    })
                  }
                  className="
                    h-11
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-700
                    outline-none
                    focus:border-black
                    focus:ring-2
                    focus:ring-black/10
                  "
                >
                  <option value="">All Locations</option>

                  {[
                    ...new Set(
                      jobs
                        .map((job) => job.location)
                        .filter(Boolean)
                    ),
                  ].map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}
                </select>

                {/* Posted */}
                <select
                  value={filters.postedOn}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      postedOn: e.target.value,
                    })
                  }
                  className="
                    h-11
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-700
                    outline-none
                    focus:border-black
                    focus:ring-2
                    focus:ring-black/10
                  "
                >
                  <option value="">Posted Anytime</option>
                  <option value="1">Last 24 Hours</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>

                {/* Status */}
                <select
                  value={filters.closeDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      closeDate: e.target.value,
                    })
                  }
                  className="
                    h-11
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-700
                    outline-none
                    focus:border-black
                    focus:ring-2
                    focus:ring-black/10
                  "
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse">

                {/* HEADER */}
                <thead>
                  <tr className="border-b border-gray-200 bg-[#0b0b0b] text-left text-xs uppercase tracking-wide text-gray-300">

                    <th
                      className="cursor-pointer px-5 py-4 font-semibold"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        Title
                        <span className="text-gray-500">
                          {sortIcon("title")}
                        </span>
                      </div>
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Type
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Location
                    </th>

                    <th
                      className="cursor-pointer px-5 py-4 font-semibold"
                      onClick={() => handleSort("createdAt")}
                    >
                      Posted
                      <span className="ml-2 text-gray-500">
                        {sortIcon("createdAt")}
                      </span>
                    </th>

                    <th
                      className="cursor-pointer px-5 py-4 font-semibold"
                      onClick={() => handleSort("lastDate")}
                    >
                      Last Date
                      <span className="ml-2 text-gray-500">
                        {sortIcon("lastDate")}
                      </span>
                    </th>

                    <th
                      className="cursor-pointer px-5 py-4 font-semibold"
                      onClick={() => handleSort("closeDate")}
                    >
                      Close Date
                      <span className="ml-2 text-gray-500">
                        {sortIcon("closeDate")}
                      </span>
                    </th>

                    <th
                      className="cursor-pointer px-5 py-4 font-semibold"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <span className="ml-2 text-gray-500">
                        {sortIcon("status")}
                      </span>
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-gray-100">

                  {sortedJobs.length > 0 ? (
                    sortedJobs.map((job) => {
                      const isSelected =
                        jobDetails?._id === job._id;

                      const status =
                        job.status || "Open";

                      return (
                        <tr
                          key={job._id}
                          className={`
                            transition-colors
                            ${
                              isSelected
                                ? "bg-gray-50"
                                : "hover:bg-gray-50"
                            }
                          `}
                        >
                          {/* TITLE */}
                          <td className="px-5 py-5">
                            <div className="max-w-[220px]">
                              <p className="truncate text-sm font-bold text-black">
                                {job.title}
                              </p>

                              <p className="mt-1 truncate text-xs text-gray-400">
                                {job.company || "Company not specified"}
                              </p>
                            </div>
                          </td>

                          {/* TYPE */}
                          <td className="px-5 py-5">
                            <span className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                              {job.employmentType || "N/A"}
                            </span>
                          </td>

                          {/* LOCATION */}
                          <td className="px-5 py-5 text-sm text-gray-600">
                            {job.location || "N/A"}
                          </td>

                          {/* POSTED */}
                          <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-600">
                            {job.createdAt
                              ? new Date(
                                  job.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>

                          {/* LAST DATE */}
                          <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-600">
                            {job.lastDate
                              ? new Date(
                                  job.lastDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>

                          {/* CLOSE DATE */}
                          <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-600">
                            {job.closeDate
                              ? new Date(
                                  job.closeDate
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-5">
                           <span
  className={`
    inline-flex
    min-h-[38px]
    min-w-[60px]
    items-center
    justify-center
    rounded-xl
    px-2
    py-1
    text-sm
    font-semibold
    ${
      status.toLowerCase() === "closed"
        ? "border border-red-200 bg-red-50 text-red-600"
        : "border border-green-200 bg-green-50 text-green-600"
    }
  `}
>
  {status}
</span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  viewJobDetails(job)
                                }
                                className="
                                min-h-[25px]
                                min-w-[45px]
                                  rounded-lg
                                  bg-black
                                  px-3.5
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-white
                                  transition
                                  hover:bg-gray-800
                                  active:scale-95
                                "
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteJob(job._id)
                                }
                                className="
                                 min-h-[35px]
                                min-w-[55px]
                                  rounded-lg
                                  border
                                  border-red-200
                                  bg-red-50
                                  px-3.5
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-red-600
                                  transition
                                  hover:bg-red-600
                                  hover:text-white
                                  active:scale-95
                                "
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">
                          —
                        </div>

                        <p className="mt-4 text-sm font-semibold text-black">
                          No jobs found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= RIGHT DETAILS ================= */}
        {jobDetails && (
          <aside className="h-fit xl:sticky xl:top-5">

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">

              {/* Header */}
              <div className="border-b border-gray-200 bg-[#0b0b0b] px-5 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Job Details
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {jobDetails.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {jobDetails.company || "Company not specified"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setJobDetails(null)}
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/10
                      text-gray-300
                      transition
                      hover:bg-white
                      hover:text-black
                    "
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 p-5">

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-medium uppercase text-gray-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-black">
                      {jobDetails.location || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-medium uppercase text-gray-400">
                      Salary
                    </p>

                    <p className="mt-1 text-sm font-semibold text-black">
                      {jobDetails.salary || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-medium uppercase text-gray-400">
                      Experience
                    </p>

                    <p className="mt-1 text-sm font-semibold text-black">
                      {jobDetails.experience || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-medium uppercase text-gray-400">
                      Type
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
                    <div className="flex flex-wrap gap-2">
                      {jobDetails.skillsRequired.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="
                              rounded-lg
                              bg-black
                              px-2.5
                              py-1.5
                              text-xs
                              font-medium
                              text-white
                            "
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No skills specified
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="mb-2 text-sm font-bold text-black">
                    Description
                  </h3>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                      {jobDetails.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setJobDetails(null)}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:border-black
                    hover:bg-black
                    hover:text-white
                  "
                >
                  Close Details
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}