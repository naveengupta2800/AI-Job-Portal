import React, { useEffect, useState } from "react";

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  /* ================= INTERVIEW MODAL ================= */

  const [showInterviewModal, setShowInterviewModal] =
    useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [interviewDate, setInterviewDate] =
    useState("");

  const [interviewTime, setInterviewTime] =
    useState("");

  /* ==================================================
     FETCH APPLICATIONS
  ================================================== */

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:8000/api/jobs/recruiter/all",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return setError(
          data.message ||
            "Failed to fetch jobs"
        );
      }

      let allApps = [];

      for (const job of data.jobs || []) {
        const appsRes = await fetch(
          `http://localhost:8000/api/apply/job/${job._id}`,
          {
            credentials: "include",
          }
        );

        const appsData =
          await appsRes.json();

        if (
          appsRes.ok &&
          appsData.applications
        ) {
          allApps.push(
            ...appsData.applications
          );
        }
      }

      if (statusFilter !== "All") {
        allApps = allApps.filter(
          (app) =>
            app.status === statusFilter
        );
      }

      setApplications(allApps);
    } catch (err) {
      console.log(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     UPDATE STATUS
  ================================================== */

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/apply/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(
          data.message ||
            "Failed to update status"
        );
      }

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? {
                ...app,
                status,
                timeline: [
                  ...(app.timeline || []),
                  {
                    status,
                    date: new Date(),
                  },
                ],
              }
            : app
        )
      );
    } catch (err) {
      console.log(err);
      alert(
        "Failed to update status"
      );
    }
  };

  /* ==================================================
     OPEN INTERVIEW MODAL
  ================================================== */

  const openInterviewModal = (app) => {
    setSelectedApplication(app);

    if (app.interview?.date) {
      const date = new Date(
        app.interview.date
      );

      setInterviewDate(
        date.toISOString().split("T")[0]
      );
    } else {
      setInterviewDate("");
    }

    setInterviewTime(
      app.interview?.time || ""
    );

    setShowInterviewModal(true);
  };

  /* ==================================================
     CLOSE INTERVIEW MODAL
  ================================================== */

  const closeInterviewModal = () => {
    setShowInterviewModal(false);

    setSelectedApplication(null);

    setInterviewDate("");

    setInterviewTime("");
  };

  /* ==================================================
     SCHEDULE INTERVIEW
  ================================================== */

  const scheduleInterview = async () => {
    if (
      !interviewDate ||
      !interviewTime
    ) {
      return alert(
        "Please select interview date and time"
      );
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/apply/${selectedApplication._id}/interview`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            date: interviewDate,
            time: interviewTime,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(
          data.message ||
            "Failed to schedule interview"
        );
      }

      setApplications((prev) =>
        prev.map((app) =>
          app._id ===
          selectedApplication._id
            ? {
                ...app,
                status: "Interview",
                interview: {
                  date: interviewDate,
                  time: interviewTime,
                },
              }
            : app
        )
      );

      alert(
        data.message ||
          "Interview scheduled successfully"
      );

      closeInterviewModal();
    } catch (err) {
      console.log(err);

      alert(
        "Failed to schedule interview"
      );
    }
  };

  /* ==================================================
     STATUS STYLE
  ================================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "Hired":
        return "border-green-200 bg-green-50 text-green-600";

      case "Rejected":
        return "border-red-200 bg-red-50 text-red-600";

      case "Shortlisted":
        return "border-blue-200 bg-blue-50 text-blue-600";

      case "Interview":
        return "border-purple-200 bg-purple-50 text-purple-600";

      default:
        return "border-gray-200 bg-gray-100 text-gray-600";
    }
  };

  /* ==================================================
     DATE FORMAT
  ================================================== */

  const formatInterviewDate = (
    date
  ) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-5 md:p-7 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Applications Received
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review candidates and manage
          their hiring process.
        </p>
      </div>

      {/* ==================================================
          FILTER CARD
      ================================================== */}

      <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">

        <div>
          <h2 className="text-base font-bold text-black">
            Candidate Applications
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            {applications.length} application
            {applications.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">

          <label className="text-sm font-semibold text-gray-600">
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="
              h-11
              min-w-[160px]
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              text-sm
              font-medium
              text-gray-700
              outline-none
              transition
              focus:border-black
              focus:bg-white
              focus:ring-2
              focus:ring-black/10
            "
          >
            {[
              "All",
              "Applied",
              "Shortlisted",
              "Interview",
              "Rejected",
              "Hired",
            ].map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Loading applications...
          </p>
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ==================================================
          EMPTY
      ================================================== */}

      {!loading &&
        !error &&
        applications.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xl">
              —
            </div>

            <h3 className="mt-4 text-base font-bold text-black">
              No applications found
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              There are no applications
              matching this filter.
            </p>
          </div>
        )}

      {/* ==================================================
          TABLE
      ================================================== */}

      {!loading &&
        applications.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1450px] border-collapse">

                {/* ================= HEADER ================= */}

                <thead>
                  <tr className="border-b border-gray-200 bg-[#0b0b0b] text-left text-xs uppercase tracking-wide text-gray-300">

                    <th className="px-5 py-4 font-semibold">
                      Job Title
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Applicant
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Email
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Phone
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Resume
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Interview
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Applied On
                    </th>

                    <th className="px-5 py-4 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* ================= BODY ================= */}

                <tbody className="divide-y divide-gray-100">

                  {applications.map(
                    (app) => (
                      <tr
                        key={app._id}
                        className="transition-colors hover:bg-gray-50"
                      >

                        {/* JOB */}
                        <td className="px-5 py-5">
                          <div className="max-w-[210px]">
                            <p className="truncate text-sm font-bold text-black">
                              {app.job?.title ||
                                "N/A"}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-400">
                              {app.job?.company ||
                                "Company"}
                            </p>
                          </div>
                        </td>

                        {/* APPLICANT */}
                        <td className="px-5 py-5">
                          <p className="whitespace-nowrap text-sm font-semibold text-black">
                            {app.applicant?.name ||
                              "N/A"}
                          </p>
                        </td>

                        {/* EMAIL */}
                        <td className="px-5 py-5">
                          <p className="text-sm text-gray-600">
                            {app.applicant?.email ||
                              "N/A"}
                          </p>
                        </td>

                        {/* PHONE */}
                        <td className="px-5 py-5">
                          <p className="whitespace-nowrap text-sm text-gray-600">
                            {app.applicant?.phone ||
                              "N/A"}
                          </p>
                        </td>

                        {/* RESUME */}
                        <td className="px-5 py-5">

                          {app.resume ? (
                            <a
                              href={`http://localhost:8000${app.resume}`}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                inline-flex
                                h-10
                                min-w-[125px]
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-300
                                bg-white
                                px-4
                                text-xs
                                font-semibold
                                text-gray-700
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:border-black
                                hover:bg-black
                                hover:text-white
                                hover:shadow-md
                                active:scale-95
                              "
                            >
                              <span className="text-sm">
                                ↗
                              </span>

                              View Resume
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No Resume
                            </span>
                          )}

                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">

                          <span
                            className={`
                              inline-flex
                              min-h-[38px]
                              min-w-[95px]
                              items-center
                              justify-center
                              rounded-xl
                              border
                              px-4
                              py-2
                              text-xs
                              font-semibold
                              ${getStatusClass(
                                app.status
                              )}
                            `}
                          >
                            {app.status ||
                              "Unknown"}
                          </span>

                        </td>

                        {/* INTERVIEW */}
                        <td className="px-5 py-5">

                          {app.interview?.date ? (
                            <div className="min-w-[150px]">

                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-xs text-purple-600">
                                  📅
                                </span>

                                <p className="text-sm font-semibold text-black">
                                  {formatInterviewDate(
                                    app.interview.date
                                  )}
                                </p>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs">
                                  🕐
                                </span>

                                <p className="text-xs font-medium text-gray-500">
                                  {app.interview.time}
                                </p>
                              </div>

                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not scheduled
                            </span>
                          )}

                        </td>

                        {/* APPLIED DATE */}
                        <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-600">
                          {app.createdAt
                            ? new Date(
                                app.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-5">

                          <div className="flex min-w-[330px] items-center justify-center gap-2">

                            {/* SHORTLIST */}
                            {app.status ===
                              "Applied" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    app._id,
                                    "Shortlisted"
                                  )
                                }
                                className="
                                  flex
                                  h-10
                                  min-w-[105px]
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-blue-200
                                  bg-blue-50
                                  px-4
                                  text-xs
                                  font-semibold
                                  text-blue-600
                                  transition-all
                                  duration-200
                                  hover:-translate-y-0.5
                                  hover:bg-blue-600
                                  hover:text-white
                                  hover:shadow-md
                                  active:scale-95
                                "
                              >
                                Shortlist
                              </button>
                            )}

                            {/* SCHEDULE / RESCHEDULE */}
                            {[
                              "Shortlisted",
                              "Interview",
                            ].includes(
                              app.status
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openInterviewModal(
                                    app
                                  )
                                }
                                className="
                                  flex
                                  h-10
                                  min-w-[145px]
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-purple-200
                                  bg-purple-50
                                  px-4
                                  text-xs
                                  font-semibold
                                  text-purple-600
                                  transition-all
                                  duration-200
                                  hover:-translate-y-0.5
                                  hover:bg-purple-600
                                  hover:text-white
                                  hover:shadow-md
                                  active:scale-95
                                "
                              >
                                {app.status ===
                                "Interview"
                                  ? "Reschedule"
                                  : "Schedule Interview"}
                              </button>
                            )}

                            {/* HIRE */}
                            {[
                              "Shortlisted",
                              "Interview",
                            ].includes(
                              app.status
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    app._id,
                                    "Hired"
                                  )
                                }
                                className="
                                  flex
                                  h-10
                                  min-w-[90px]
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-green-200
                                  bg-green-50
                                  px-4
                                  text-xs
                                  font-semibold
                                  text-green-600
                                  transition-all
                                  duration-200
                                  hover:-translate-y-0.5
                                  hover:bg-green-600
                                  hover:text-white
                                  hover:shadow-md
                                  active:scale-95
                                "
                              >
                                Hire
                              </button>
                            )}

                            {/* REJECT */}
                            {app.status !==
                              "Hired" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    app._id,
                                    "Rejected"
                                  )
                                }
                                className="
                                  flex
                                  h-10
                                  min-w-[90px]
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-red-200
                                  bg-red-50
                                  px-4
                                  text-xs
                                  font-semibold
                                  text-red-600
                                  transition-all
                                  duration-200
                                  hover:-translate-y-0.5
                                  hover:bg-red-600
                                  hover:text-white
                                  hover:shadow-md
                                  active:scale-95
                                "
                              >
                                Reject
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ==================================================
          INTERVIEW MODAL
      ================================================== */}

      {showInterviewModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/20
            px-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
          >

            {/* HEADER */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-800
                bg-[#0b0b0b]
                px-6
                py-5
                text-white
              "
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Interview
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {selectedApplication
                    ?.interview?.date
                    ? "Reschedule Interview"
                    : "Schedule Interview"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {selectedApplication
                    ?.applicant?.name ||
                    "Candidate"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeInterviewModal
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/10
                  text-lg
                  text-gray-300
                  transition
                  hover:bg-white
                  hover:text-black
                "
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-5 p-6">

              {/* Candidate Info */}
              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Candidate
                </p>

                <p className="mt-1 text-sm font-bold text-black">
                  {selectedApplication
                    ?.applicant?.name ||
                    "N/A"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedApplication
                    ?.job?.title ||
                    "Job"}
                </p>

              </div>

              {/* DATE */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Interview Date
                </label>

                <input
                  type="date"
                  value={interviewDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setInterviewDate(
                      e.target.value
                    )
                  }
                  className="
                    mt-2
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-4
                    text-sm
                    text-black
                    outline-none
                    transition
                    focus:border-black
                    focus:bg-white
                    focus:ring-2
                    focus:ring-black/10
                  "
                />
              </div>

              {/* TIME */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Interview Time
                </label>

                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) =>
                    setInterviewTime(
                      e.target.value
                    )
                  }
                  className="
                    mt-2
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-4
                    text-sm
                    text-black
                    outline-none
                    transition
                    focus:border-black
                    focus:bg-white
                    focus:ring-2
                    focus:ring-black/10
                  "
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={
                    closeInterviewModal
                  }
                  className="
                    min-w-[110px]
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    transition-all
                    hover:bg-gray-100
                    hover:text-black
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    scheduleInterview
                  }
                  className="
                    min-w-[160px]
                     min-h-[40px]
                    rounded-xl
                    bg-black
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-md
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-gray-800
                    hover:shadow-lg
                    active:scale-95
                  "
                >
                  {selectedApplication
                    ?.interview?.date
                    ? "Update Interview"
                    : "Schedule Interview"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}