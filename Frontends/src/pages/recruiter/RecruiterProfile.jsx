
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";

function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const baseURL = api.defaults.baseURL || "http://localhost:5000";
  return `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

const initialProfile = {
  name: "",
  email: "",
  company: "",
  companyWebsite: "",
  phone: "",
};

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const { data } = await api.get("/api/profile/recruiter");

        if (!active) return;

        const result = data?.profile || {};

        setProfile({
          name: result.name || "",
          email: result.email || "",
          company: result.company || "",
          companyWebsite: result.companyWebsite || "",
          phone: result.phone || "",
        });

        setProfileImage(result.profileImage || "");
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Unable to load your company profile."));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setError("");
    setSuccess("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.put("/api/profile/recruiter", {
        name: profile.name.trim(),
        company: profile.company.trim(),
        companyWebsite: profile.companyWebsite.trim(),
        phone: profile.phone.trim(),
      });

      if (data?.profile) {
        setProfile((current) => ({
          ...current,
          ...data.profile,
          email: data.profile.email || current.email,
        }));
      }

      setSuccess(data?.message || "Profile details saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save profile details."));
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload() {
    if (!imageFile) {
      setError("Please choose an image first.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("profileImage", imageFile);

      const { data } = await api.post(
        "/api/profile/recruiter/image",
        formData
      );

      if (data?.profileImage) {
        setProfileImage(data.profileImage);
      }

      setImageFile(null);
      setSuccess(data?.message || "Profile image uploaded successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to upload profile image."));
    } finally {
      setUploading(false);
    }
  }

  const displayedImage = preview || getImageUrl(profileImage);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading company profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Recruiter settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Company profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your recruiter details and company information in one place.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <p>{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="font-bold"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-500" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex items-end justify-between gap-3">
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Recruiter profile"
                  className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-sm">
                  {(profile.name || "R").charAt(0).toUpperCase()}
                </div>
              )}

              <span className="mb-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Recruiter
              </span>
            </div>

            <h2 className="mt-4 break-words text-xl font-bold text-slate-900">
              {profile.name || "Your name"}
            </h2>
            <p className="mt-1 break-all text-sm text-slate-500">
              {profile.email || "Email not available"}
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900">
                Profile photo
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Use a clear image so candidates can recognize your recruiter account.
              </p>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50">
                <span>↑</span>
                {imageFile ? "Choose another image" : "Choose image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {imageFile && (
                <p className="mt-2 break-all text-xs text-slate-500">
                  {imageFile.name}
                </p>
              )}

              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!imageFile || uploading}
                className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {uploading ? "Uploading..." : "Upload photo"}
              </button>

              <p className="mt-2 text-center text-xs text-slate-400">
                Image files only · Maximum 5 MB
              </p>
            </div>
          </div>
        </aside>

        <form
          onSubmit={handleSave}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <h2 className="text-lg font-bold text-slate-900">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your recruiter and company contact details up to date.
            </p>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Email cannot be changed here.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="Enter contact number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Company name
                </label>
                <input
                  id="company"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="Enter company name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="companyWebsite"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Company website
                </label>
                <input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  value={profile.companyWebsite}
                  onChange={handleChange}
                  maxLength={300}
                  placeholder="https://yourcompany.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Discard changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
