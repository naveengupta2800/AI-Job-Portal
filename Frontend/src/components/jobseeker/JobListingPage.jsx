import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Building2,
  Zap,
  ShieldCheck,
  BriefcaseBusiness,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

import JobCard from "./JobCard.jsx";

export default function JobListingPage() {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  /* =====================================================
     FETCH DATA
  ===================================================== */

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      await Promise.all([fetchJobs(), fetchSavedJobs()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/jobs/all",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.log("Fetch jobs error:", err);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/save/saved",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSavedJobIds(
          (data.savedJobs || []).map((job) => job._id)
        );
      }
    } catch (err) {
      console.log("Fetch saved jobs error:", err);
    }
  };

  /* =====================================================
     SAVE / UNSAVE JOB
  ===================================================== */

  const handleToggleSave = async (jobId) => {
    const isSaved = savedJobIds.includes(jobId);

    try {
      const url = `http://localhost:8000/api/save/${
        isSaved ? "unsave" : "save"
      }/${jobId}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        alert("Action failed");
        return;
      }

      setSavedJobIds((prev) =>
        isSaved
          ? prev.filter((id) => id !== jobId)
          : [...prev, jobId]
      );
    } catch (err) {
      console.log("Save job error:", err);
      alert("Something went wrong");
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return jobs;

    return jobs.filter((job) => {
      return (
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
      );
    });
  }, [jobs, keyword]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center  bg-[#e6e8ef]">
        <div className="flex flex-col items-center gap-4">

         <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-500" />
          <p className="text-sm font-medium text-slate-600">
  Loading jobs...
</p>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-[#f1f2f6] text-slate-900">

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            HERO
        =================================================== */}

 {/* ===================================================
    HERO
=================================================== */}

<section
  className="
    relative
    mb-10
    overflow-hidden
    rounded-3xl
    border
    border-slate-200
    bg-gradient-to-br
    from-white
    via-white
    to-blue-50
    p-6
    shadow-[0_20px_60px_rgba(15,23,42,0.10)]
    transition-all
    duration-300
    hover:border-blue-200
    hover:shadow-[0_25px_70px_rgba(37,99,235,0.14)]
    sm:p-8
    lg:p-10
  "
>
  {/* Background effects */}

  <div
    className="
      pointer-events-none
      absolute
      -right-20
      -top-20
      h-64
      w-64
      rounded-full
      bg-indigo-400/10
      blur-3xl
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -bottom-24
      left-1/3
      h-56
      w-56
      rounded-full
      bg-blue-400/10
      blur-3xl
    "
  />

  {/* Content */}

  <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

    {/* Hero Text */}

    <div className="max-w-2xl">

      {/* Badge */}

      <div
        className="
          mb-4
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-indigo-200
          bg-indigo-50
          px-3
          py-1.5
          text-xs
          font-semibold
          text-indigo-600
        "
      >
        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-indigo-500
            shadow-[0_0_8px_rgba(99,102,241,0.6)]
          "
        />

        Discover your next opportunity
      </div>

      {/* Heading */}

      <h1
        className="
          text-3xl
          font-bold
          tracking-tight
          text-slate-900
          sm:text-4xl
          lg:text-5xl
        "
      >
        Find Your{" "}

        <span
          className="
            bg-gradient-to-r
            from-indigo-600
            to-blue-600
            bg-clip-text
            text-transparent
          "
        >
          Dream Job
        </span>
      </h1>

      {/* Description */}

      <p
        className="
          mt-4
          max-w-xl
          text-sm
          leading-6
          text-slate-600
          sm:text-base
        "
      >
        Explore verified opportunities from leading companies
        and find the role that matches your skills and career
        goals.
      </p>
    </div>

    {/* Search */}

    <div className="w-full lg:max-w-[430px]">

      <label
        className="
          mb-2
          block
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-slate-500
        "
      >
        Search opportunities
      </label>

      <div
        className="
          group
          flex
          items-center
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3
          shadow-sm
          transition-all
          duration-200
          focus-within:border-indigo-400
          focus-within:ring-4
          focus-within:ring-indigo-500/10
        "
      >
        <Search
          size={19}
          className="
            shrink-0
            text-slate-400
            transition-colors
            group-focus-within:text-indigo-500
          "
        />

        <input
          type="text"
          placeholder="Title, company or location..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="
            w-full
            bg-transparent
            px-3
            py-3.5
            text-sm
            text-slate-900
            outline-none
            placeholder:text-slate-400
          "
        />

        {keyword && (
          <button
            type="button"
            onClick={() => setKeyword("")}
            className="
              rounded-lg
              px-2
              py-1
              text-xs
              font-medium
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            Clear
          </button>
        )}
      </div>
    </div>
  </div>
</section>

{/* ===================================================
    STATS
=================================================== */}

<section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

  {/* Jobs */}

  <div
    className="
      group
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-indigo-200
      hover:shadow-lg
      hover:shadow-indigo-500/10
    "
  >
    <div className="flex items-center justify-between">

      <div>
        <p className="text-xs font-medium text-slate-500">
          Opportunities
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          10,000+
        </h3>
      </div>

      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-indigo-50
          text-indigo-600
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <BriefcaseBusiness size={21} />
      </div>
    </div>
  </div>

  {/* Companies */}

  <div
    className="
      group
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-blue-200
      hover:shadow-lg
      hover:shadow-blue-500/10
    "
  >
    <div className="flex items-center justify-between">

      <div>
        <p className="text-xs font-medium text-slate-500">
          Companies
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          1,200+
        </h3>
      </div>

      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-blue-600
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <Building2 size={21} />
      </div>
    </div>
  </div>

  {/* Apply */}

  <div
    className="
      group
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-amber-200
      hover:shadow-lg
      hover:shadow-amber-500/10
    "
  >
    <div className="flex items-center justify-between">

      <div>
        <p className="text-xs font-medium text-slate-500">
          Application
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          Instant
        </h3>
      </div>

      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-amber-50
          text-amber-600
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <Zap size={21} />
      </div>
    </div>
  </div>

  {/* Verified */}

  <div
    className="
      group
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-emerald-200
      hover:shadow-lg
      hover:shadow-emerald-500/10
    "
  >
    <div className="flex items-center justify-between">

      <div>
        <p className="text-xs font-medium text-slate-500">
          Recruiters
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          Verified
        </h3>
      </div>

      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-emerald-50
          text-emerald-600
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <ShieldCheck size={21} />
      </div>
    </div>
  </div>

</section>

        {/* ===================================================
            JOB SECTION HEADER
        =================================================== */}

  {/* ===================================================
    JOB SECTION HEADER
=================================================== */}

<section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

  <div>
    <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
      Latest Opportunities
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      {filteredJobs.length}{" "}
      {filteredJobs.length === 1 ? "job" : "jobs"} available
    </p>
  </div>

  {keyword && (
    <div className="inline-flex w-fit items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
      Results for "{keyword}"
    </div>
  )}
</section>

{/* ===================================================
    JOB GRID
=================================================== */}

<section>
  {filteredJobs.length > 0 ? (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

      {filteredJobs.map((job) => (
        <div
          key={job._id}
          className="
            transition-all
            duration-300
            hover:-translate-y-1
          "
        >
          <JobCard
            job={job}
            isSaved={savedJobIds.includes(job._id)}
            onToggleSave={handleToggleSave}
          />
        </div>
      ))}

    </div>
  ) : (
    <div
      className="
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-200
        bg-white
        px-6
        text-center
        shadow-sm
      "
    >

      <div
        className="
          mb-5
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-slate-50
          text-slate-400
        "
      >
        <Search size={28} />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        No jobs found
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        We couldn't find any jobs matching your search.
        Try another title, company or location.
      </p>

      {keyword && (
        <button
          type="button"
          onClick={() => setKeyword("")}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-indigo-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-indigo-500
            hover:shadow-lg
            hover:shadow-indigo-500/20
          "
        >
          Clear Search
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  )}
        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-20 border-t border-slate-200 bg-[#f1f5f9]">

  <div className="mx-auto grid w-full max-w-[1250px] grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">

    {/* BRAND */}

    <div className="lg:col-span-2">

      <div className="flex items-center gap-3">

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-indigo-500
            to-blue-600
            text-white
            shadow-lg
            shadow-indigo-500/20
          "
        >
          <BriefcaseBusiness size={21} />
        </div>

        <div>

          <h3 className="text-lg font-bold text-slate-900">
            Job
            <span className="text-indigo-600">
              Matchers
            </span>
          </h3>

          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Find your opportunity
          </p>

        </div>

      </div>

      <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
        Connecting talented people with meaningful
        opportunities from trusted companies.
      </p>

    </div>

    {/* SERVICES */}

    <div>

      <h3 className="mb-4 text-sm font-bold text-slate-900">
        Services
      </h3>

      <ul className="space-y-3 text-sm text-slate-500">

        <li>
          <a
            href="#"
            className="transition-colors hover:text-indigo-600"
          >
            Job Search
          </a>
        </li>

        <li>
          <a
            href="#"
            className="transition-colors hover:text-indigo-600"
          >
            Career Opportunities
          </a>
        </li>

        <li>
          <a
            href="#"
            className="transition-colors hover:text-indigo-600"
          >
            Recruiter Services
          </a>
        </li>

      </ul>

    </div>

    {/* COMPANY */}

    <div>

      <h3 className="mb-4 text-sm font-bold text-slate-900">
        Company
      </h3>

      <ul className="space-y-3 text-sm text-slate-500">

        <li>
          <a
            href="#"
            className="transition-colors hover:text-indigo-600"
          >
            About Us
          </a>
        </li>

        <li>
          <a
            href="#"
            className="transition-colors hover:text-indigo-600"
          >
            Our Team
          </a>
        </li>

        <li>
          <a
            href="#"
            className="transition-colors hover:text-indigo-600"
          >
            Careers
          </a>
        </li>

      </ul>

    </div>

    {/* SOCIAL */}

    <div>

      <h3 className="mb-4 text-sm font-bold text-slate-900">
        Connect
      </h3>

      <div className="flex items-center gap-2">

        <a
          href="#"
          aria-label="Facebook"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-1
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
          "
        >
          <Facebook size={17} />
        </a>

        <a
          href="#"
          aria-label="Twitter"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-1
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
          "
        >
          <Twitter size={17} />
        </a>

        <a
          href="#"
          aria-label="Instagram"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-1
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
          "
        >
          <Instagram size={17} />
        </a>

        <a
          href="#"
          aria-label="LinkedIn"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-1
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
          "
        >
          <Linkedin size={17} />
        </a>

      </div>

    </div>

  </div>

  {/* COPYRIGHT */}

  <div className="border-t border-slate-200 px-4 py-5 text-center">

    <p className="text-xs text-slate-500">
      Job Matchers © {new Date().getFullYear()} · All rights reserved.
    </p>

  </div>

</footer>
</div>
  );
}

