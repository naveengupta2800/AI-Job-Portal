
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import api, { getErrorMessage } from "../../services/api.js";

const initialForm = {
  title: "",
  company: "",
  location: "",
  employmentType: "Full-Time",
  experience: "",
  salary: "",
  closeDate: "",
  description: "",
  skillsRequired: "",
  responsibility: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

function Field({ label, required, children }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const skillsRequired = form.skillsRequired
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const responsibility = form.responsibility
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      employmentType: form.employmentType,
      experience: form.experience.trim(),
      salary: form.salary.trim(),
      description: form.description.trim(),
      skillsRequired,
      responsibility,
      ...(form.closeDate ? { closeDate: form.closeDate } : {}),
    };

    try {
      const response = await api.post("/api/jobs/create", payload);
      setSuccess(response.data?.message || "Job created successfully.");

      const createdJob = response.data?.job;
      if (createdJob?._id) {
        navigate("/recruiter/my-jobs", {
          replace: true,
          state: { createdJobId: createdJob._id },
        });
      } else {
        navigate("/recruiter/my-jobs", { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create job. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/recruiter/my-jobs"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-700"
      >
        <ArrowLeft size={16} /> Back to job listings
      </Link>

      <div className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 p-6 text-white sm:p-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-200">Recruitment workspace</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Post a new job
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Add the details candidates need to understand the role and apply.
            </p>
          </div>
          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:flex">
            <BriefcaseBusiness size={30} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-950">Job information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Start with the role and company details.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Job title" required>
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="e.g. Junior Software Developer"
                className={inputClass}
              />
            </Field>

            <Field label="Company name" required>
              <input
                required
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="Enter company name"
                className={inputClass}
              />
            </Field>

            <Field label="Job location" required>
              <span className="relative block">
                <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="e.g. Bhopal, India or Remote"
                  className={`${inputClass} pl-10`}
                />
              </span>
            </Field>

            <Field label="Employment type" required>
              <select
                required
                value={form.employmentType}
                onChange={(event) => updateField("employmentType", event.target.value)}
                className={inputClass}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Contract">Contract</option>
              </select>
            </Field>

            <Field label="Experience required">
              <input
                value={form.experience}
                onChange={(event) => updateField("experience", event.target.value)}
                placeholder="e.g. Fresher / 0–2 years"
                className={inputClass}
              />
            </Field>

            <Field label="Salary / package">
              <input
                value={form.salary}
                onChange={(event) => updateField("salary", event.target.value)}
                placeholder="e.g. ₹4–6 LPA or Negotiable"
                className={inputClass}
              />
            </Field>

            <Field label="Application closing date">
              <span className="relative block">
                <CalendarDays size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.closeDate}
                  onChange={(event) => updateField("closeDate", event.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </span>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-950">Role description</h2>
              <p className="mt-1 text-sm text-slate-500">
                Explain the responsibilities and candidate requirements.
              </p>
            </div>
          </div>

          <Field label="Job description" required>
            <textarea
              required
              minLength={20}
              rows={6}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the role, team, expectations and what the candidate will work on..."
              className={`${inputClass} resize-y leading-6`}
            />
          </Field>

          <div className="mt-5">
            <Field label="Required skills">
              <textarea
                rows={3}
                value={form.skillsRequired}
                onChange={(event) => updateField("skillsRequired", event.target.value)}
                placeholder="React, JavaScript, Node.js, SQL, Git"
                className={`${inputClass} resize-y`}
              />
              <span className="mt-1.5 block text-xs text-slate-400">
                Separate skills with commas.
              </span>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Responsibilities">
              <textarea
                rows={4}
                value={form.responsibility}
                onChange={(event) => updateField("responsibility", event.target.value)}
                placeholder={"Build and maintain web applications\nCollaborate with the development team\nWrite clean, maintainable code"}
                className={`${inputClass} resize-y leading-6`}
              />
              <span className="mt-1.5 block text-xs text-slate-400">
                Add one responsibility per line.
              </span>
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/recruiter/my-jobs"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save size={17} />
            )}
            {submitting ? "Publishing..." : "Publish job"}
          </button>
        </div>
      </form>
    </div>
  );
}
