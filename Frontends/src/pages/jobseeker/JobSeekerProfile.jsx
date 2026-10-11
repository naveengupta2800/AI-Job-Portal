
import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  skills: [],
  education: [],
  experience: [],
};

function fileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = (api.defaults.baseURL || "http://localhost:5000").replace(/\/$/, "");
  return `${base}/${String(path).replace(/^\//, "")}`;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function JobSeekerProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [profileImage, setProfileImage] = useState("");
  const [resume, setResume] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data } = await api.get("/api/profile/jobseeker");
        if (!active) return;

        const p = data?.profile || {};

        setProfile({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          address: p.address || "",
          skills: Array.isArray(p.skills) ? p.skills : [],
          education: Array.isArray(p.education) ? p.education : [],
          experience: Array.isArray(p.experience) ? p.experience : [],
        });

        setProfileImage(p.profileImage || "");
        setResume(p.resume || "");
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Unable to load your profile."));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const completion = useMemo(() => {
    const checks = [
      Boolean(profile.name.trim()),
      Boolean(profile.phone.trim()),
      Boolean(profile.address.trim()),
      profile.skills.length > 0,
      profile.education.length > 0,
      profile.experience.length > 0,
      Boolean(profileImage),
      Boolean(resume),
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [profile, profileImage, resume]);

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
    setError("");
    setNotice("");
  }

  function updateArrayItem(field, index, key, value) {
    setProfile((current) => ({
      ...current,
      [field]: current[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
    setError("");
    setNotice("");
  }

  function addItem(field) {
    const newItem =
      field === "education"
        ? { school: "", degree: "", year: "" }
        : { company: "", title: "", years: "" };

    setProfile((current) => ({
      ...current,
      [field]: [...current[field], newItem],
    }));
  }

  function removeItem(field, index) {
    setProfile((current) => ({
      ...current,
      [field]: current[field].filter((_, i) => i !== index),
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      skills: profile.skills.map((skill) => skill.trim()).filter(Boolean),
      education: profile.education.filter(
        (item) => item.school?.trim() || item.degree?.trim() || item.year?.trim()
      ),
      experience: profile.experience.filter(
        (item) => item.company?.trim() || item.title?.trim() || item.years?.trim()
      ),
    };

    try {
      const { data } = await api.put("/api/profile/jobseeker", payload);
      const p = data?.profile || {};

      setProfile((current) => ({
        ...current,
        name: p.name ?? payload.name,
        phone: p.phone ?? payload.phone,
        address: p.address ?? payload.address,
        skills: Array.isArray(p.skills) ? p.skills : payload.skills,
        education: Array.isArray(p.education) ? p.education : payload.education,
        experience: Array.isArray(p.experience) ? p.experience : payload.experience,
        email: p.email ?? current.email,
      }));

      setEditing(false);
      setNotice(data?.message || "Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save your profile."));
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage() {
    if (!imageFile) {
      setError("Please select a profile image first.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("profileImage", imageFile);

      const { data } = await api.post(
        "/api/profile/jobseeker/image",
        formData
      );

      if (data?.profileImage) setProfileImage(data.profileImage);
      setImageFile(null);
      setNotice(data?.message || "Profile image uploaded successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to upload profile image."));
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadResume() {
    if (!resumeFile) {
      setError("Please select your resume first.");
      return;
    }

    setUploadingResume(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await api.post(
        "/api/profile/jobseeker/resume",
        formData
      );

      if (data?.resume) setResume(data.resume);
      setResumeFile(null);
      setNotice(data?.message || "Resume uploaded successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to upload resume."));
    } finally {
      setUploadingResume(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const imagePreview = imageFile
    ? URL.createObjectURL(imageFile)
    : fileUrl(profileImage);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Career workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          My profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Keep your information, skills, education and resume ready for your
          next opportunity.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => setError("")} className="font-bold">×</button>
        </div>
      )}

      {notice && (
        <div role="status" className="flex justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{notice}</p>
          <button type="button" onClick={() => setNotice("")} className="font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-500" />

            <div className="px-6 pb-6">
              <div className="-mt-12">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Your profile"
                    className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-sm">
                    {(profile.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="mt-4 break-words text-xl font-bold text-slate-900">
                {profile.name || "Your name"}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-500">
                {profile.email || "Email not available"}
              </p>

              {profile.address && (
                <p className="mt-2 break-words text-sm text-slate-500">
                  📍 {profile.address}
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Profile completion
                  </h3>
                  <span className="text-sm font-bold text-indigo-600">
                    {completion}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Add your skills, education, experience and resume to complete
                  your profile.
                </p>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Profile photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      setError("Please choose a valid image.");
                      event.target.value = "";
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      setError("Image must be smaller than 5 MB.");
                      event.target.value = "";
                      return;
                    }

                    setImageFile(file);
                    setError("");
                    setNotice("");
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />

                <button
                  type="button"
                  onClick={uploadImage}
                  disabled={!imageFile || uploadingImage}
                  className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {uploadingImage ? "Uploading..." : "Upload photo"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">Resume</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload your latest resume so recruiters can review your
              qualifications.
            </p>

            {resume && (
              <a
                href={fileUrl(resume)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg">
                  📄
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-emerald-800">
                    View uploaded resume
                  </span>
                  <span className="mt-1 block text-xs text-emerald-700">
                    Open document ↗
                  </span>
                </span>
              </a>
            )}

            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const allowedExtensions = /\.(pdf|doc|docx)$/i;
                if (!allowedExtensions.test(file.name)) {
                  setError("Resume must be a PDF, DOC or DOCX file.");
                  event.target.value = "";
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  setError("Resume must be smaller than 5 MB.");
                  event.target.value = "";
                  return;
                }

                setResumeFile(file);
                setError("");
                setNotice("");
              }}
              className="mt-4 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />

            {resumeFile && (
              <p className="mt-2 break-all text-xs text-slate-500">
                Selected: {resumeFile.name}
              </p>
            )}

            <button
              type="button"
              onClick={uploadResume}
              disabled={!resumeFile || uploadingResume}
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingResume ? "Uploading..." : "Upload resume"}
            </button>

            <p className="mt-2 text-xs text-slate-400">
              PDF, DOC or DOCX · Maximum 5 MB
            </p>
          </section>
        </aside>

        <form onSubmit={saveProfile} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              title="Personal information"
              description="Your basic contact details."
              action={
                !editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setNotice("");
                      setError("");
                    }}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Edit profile
                  </button>
                )
              }
            />

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  className={inputClass}
                  value={profile.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter your name"
                  maxLength={100}
                  required
                  disabled={!editing}
                />
              </Field>

              <Field label="Email address">
                <input
                  className={`${inputClass} cursor-not-allowed bg-slate-50`}
                  type="email"
                  value={profile.email}
                  readOnly
                />
              </Field>

              <Field label="Phone number">
                <input
                  className={inputClass}
                  type="tel"
                  value={profile.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="Enter phone number"
                  maxLength={20}
                  disabled={!editing}
                />
              </Field>

              <Field label="Address">
                <input
                  className={inputClass}
                  value={profile.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="City, state"
                  maxLength={200}
                  disabled={!editing}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              title="Skills"
              description="Add technical and professional skills."
              action={
                editing && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField("skills", [...profile.skills, ""])
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    + Add skill
                  </button>
                )
              }
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <div
                  key={`skill-${index}`}
                  className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2"
                >
                  {editing ? (
                    <>
                      <input
                        value={skill}
                        onChange={(event) => {
                          const next = [...profile.skills];
                          next[index] = event.target.value;
                          updateField("skills", next);
                        }}
                        placeholder="Skill name"
                        className="w-28 bg-transparent text-sm text-indigo-800 outline-none"
                        maxLength={60}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "skills",
                            profile.skills.filter((_, i) => i !== index)
                          )
                        }
                        className="text-indigo-500 hover:text-red-600"
                        aria-label="Remove skill"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-indigo-700">
                      {skill}
                    </span>
                  )}
                </div>
              ))}

              {profile.skills.length === 0 && (
                <p className="text-sm text-slate-500">
                  No skills added yet. Click Edit profile to add your skills.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              title="Education"
              description="Add your academic qualifications."
              action={
                editing && (
                  <button
                    type="button"
                    onClick={() => addItem("education")}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    + Add education
                  </button>
                )
              }
            />

            <div className="mt-5 space-y-4">
              {profile.education.map((item, index) => (
                <div
                  key={`education-${index}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="School / College">
                      <input
                        className={inputClass}
                        value={item.school || ""}
                        onChange={(event) =>
                          updateArrayItem("education", index, "school", event.target.value)
                        }
                        placeholder="College or university"
                        disabled={!editing}
                      />
                    </Field>

                    <Field label="Degree">
                      <input
                        className={inputClass}
                        value={item.degree || ""}
                        onChange={(event) =>
                          updateArrayItem("education", index, "degree", event.target.value)
                        }
                        placeholder="B.Tech, BCA, MCA..."
                        disabled={!editing}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Year">
                        <input
                          className={inputClass}
                          value={item.year || ""}
                          onChange={(event) =>
                            updateArrayItem("education", index, "year", event.target.value)
                          }
                          placeholder="2023 - 2027"
                          disabled={!editing}
                        />
                      </Field>
                    </div>
                  </div>

                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeItem("education", index)}
                      className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove education
                    </button>
                  )}
                </div>
              ))}

              {profile.education.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No education details added yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              title="Experience"
              description="Include internships, projects or work experience."
              action={
                editing && (
                  <button
                    type="button"
                    onClick={() => addItem("experience")}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    + Add experience
                  </button>
                )
              }
            />

            <div className="mt-5 space-y-4">
              {profile.experience.map((item, index) => (
                <div
                  key={`experience-${index}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Company / Organization">
                      <input
                        className={inputClass}
                        value={item.company || ""}
                        onChange={(event) =>
                          updateArrayItem("experience", index, "company", event.target.value)
                        }
                        placeholder="Company or project"
                        disabled={!editing}
                      />
                    </Field>

                    <Field label="Role / Title">
                      <input
                        className={inputClass}
                        value={item.title || ""}
                        onChange={(event) =>
                          updateArrayItem("experience", index, "title", event.target.value)
                        }
                        placeholder="Software Developer Intern"
                        disabled={!editing}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Duration">
                        <input
                          className={inputClass}
                          value={item.years || ""}
                          onChange={(event) =>
                            updateArrayItem("experience", index, "years", event.target.value)
                          }
                          placeholder="6 months / 2025 - 2026"
                          disabled={!editing}
                        />
                      </Field>
                    </div>
                  </div>

                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeItem("experience", index)}
                      className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove experience
                    </button>
                  )}
                </div>
              ))}

              {profile.experience.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No experience added yet. You can also include internships or projects.
                </p>
              )}
            </div>
          </section>

          {editing && (
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={async () => {
                  setEditing(false);
                  setError("");
                  setNotice("");
                  setLoading(true);

                  try {
                    const { data } = await api.get("/api/profile/jobseeker");
                    const p = data?.profile || {};

                    setProfile({
                      name: p.name || "",
                      email: p.email || "",
                      phone: p.phone || "",
                      address: p.address || "",
                      skills: Array.isArray(p.skills) ? p.skills : [],
                      education: Array.isArray(p.education) ? p.education : [],
                      experience: Array.isArray(p.experience) ? p.experience : [],
                    });
                    setProfileImage(p.profileImage || "");
                    setResume(p.resume || "");
                  } catch (err) {
                    setError(getErrorMessage(err, "Unable to reload your profile."));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving profile..." : "Save changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
