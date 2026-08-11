import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateJobForm() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-Time",
    salary: "",
    description: "",
    requirements: "",
    experience: "",
    skills: "",
    closeDate: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          company: form.company,
          location: form.location,
          employmentType: form.type,
          salary: form.salary,
          description: form.description,
          experience: form.experience,
          skillsRequired: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          responsibility: form.requirements
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          closeDate: form.closeDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Error creating job");
      }

      alert("Job created successfully!");
      navigate("/my-jobs");
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      company: "",
      location: "",
      type: "Full-Time",
      salary: "",
      description: "",
      requirements: "",
      experience: "",
      skills: "",
      closeDate: "",
    });
  };

  const inputClass = `
   min-h-[35px]
    mt-2
    w-full
    rounded-xl
    border border-gray-200
    bg-gray-50
    px-4
    py-3
    text-sm
    text-black
    outline-none
    transition-all
    duration-200
    placeholder:text-gray-400
    focus:border-black
    focus:bg-white
    focus:ring-2
    focus:ring-black/10
  `;

  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-5 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
            Create New Job
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Post a job to attract qualified candidates.
          </p>
        </div>

        {/* ================= FORM CARD ================= */}
        <form
          onSubmit={handleSubmit}
          className="
            overflow-hidden
            rounded-2xl
            border border-gray-200
            bg-white
            shadow-sm
          "
        >
          {/* ================= FORM HEADER ================= */}
          <div className="border-b border-gray-200 px-6 py-5 md:px-8">
            <h2 className="text-lg font-bold text-black">
              Job Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to publish your job listing.
            </p>

            <p className="mt-3 text-xs text-gray-400">
              <span className="font-bold text-red-500">*</span>{" "}
              Required fields
            </p>
          </div>

          {/* ================= FORM BODY ================= */}
          <div className="space-y-7 px-6 py-7 md:px-8">

            {/* Job Title + Company */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className={labelClass}>
                <span>
                  <span className="mr-1 text-red-500 ">*</span>
                  Job Title
                </span>

                <input
                  required
                  name="title"
                  placeholder="e.g. Full Stack Developer"
                  className={inputClass}
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className={labelClass}>
                <span>
                  <span className="mr-1 text-red-500">*</span>
                  Company
                </span>

                <input
                  required
                  name="company"
                  placeholder="e.g. Tech Solutions Pvt. Ltd."
                  className={inputClass}
                  value={form.company}
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Location + Type + Salary */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <label className={labelClass}>
                <span>
                  <span className="mr-1 text-red-500">*</span>
                  Location
                </span>

                <input
                  required
                  name="location"
                  placeholder="e.g. Indore, MP"
                  className={inputClass}
                  value={form.location}
                  onChange={handleChange}
                />
              </label>

              <label className={labelClass}>
                Employment Type

                <select
                  name="type"
                  className={inputClass}
                  value={form.type}
                  onChange={handleChange}
                >
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Internship</option>
                  <option>Remote</option>
                  <option>Contract</option>
                </select>
              </label>

              <label className={labelClass}>
                Salary Range

                <input
                  name="salary"
                  placeholder="e.g. 5 - 8 LPA"
                  className={inputClass}
                  value={form.salary}
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Experience + Skills + Closing Date */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <label className={labelClass}>
                Experience

                <input
                  name="experience"
                  placeholder="e.g. 2-5 years"
                  className={inputClass}
                  value={form.experience}
                  onChange={handleChange}
                />
              </label>

              <label className={labelClass}>
                Required Skills

                <input
                  name="skills"
                  placeholder="React, Node.js, MongoDB"
                  className={inputClass}
                  value={form.skills}
                  onChange={handleChange}
                />

                <span className="mt-1.5 block text-xs font-normal text-gray-400">
                  Separate multiple skills with commas.
                </span>
              </label>

              <label className={labelClass}>
                Closing Date

                <input
                  type="date"
                  name="closeDate"
                  className={inputClass}
                  value={form.closeDate}
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Description */}
            <label className={labelClass}>
              <span>
                <span className="mr-1 text-red-500">*</span>
                Job Description
              </span>

              <textarea
                required
                name="description"
                placeholder="Describe the role, team, work environment, and what the candidate will be responsible for..."
                rows={6}
                className={`${inputClass} resize-y leading-6`}
                value={form.description}
                onChange={handleChange}
              />
            </label>

            {/* Responsibilities */}
            <label className={labelClass} >
              Responsibilities

              <input
                name="requirements"
                placeholder="Develop features, review code, collaborate with teams"
                className={inputClass}
                value={form.requirements}
                onChange={handleChange}
              />

              <span className="mt-1.5 block text-xs font-normal text-gray-400">
                Separate multiple responsibilities with commas.
              </span>
            </label>
          </div>

          {/* ================= FOOTER BUTTONS ================= */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 md:px-8">

            {/* Reset */}
       <button
  type="button"
  onClick={resetForm}
  className="
    min-w-[120px]
     min-h-[40px]
    rounded-xl
    border-2
    border-gray-300
    bg-white
    px-6
    py-3.5
    text-base
    font-semibold
    text-gray-700
    shadow-sm
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:border-gray-500
    hover:bg-gray-100
    hover:text-black
    hover:shadow-md
    active:translate-y-0
    active:scale-[0.98]
  "
>
  Reset
</button>

            {/* Create Job */}
            <button
  type="submit"
  className="
    min-w-[120px]
    min-h-[40px]
    rounded-xl
    bg-black
    px-7
    py-5
    text-base
    font-semibold
    text-white
    shadow-lg
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:bg-gray-800
    hover:shadow-xl
    active:translate-y-0
    active:scale-[0.98]
  "
>
  Create Job
</button>
          </div>
        </form>
      </div>
    </div>
  );
}
