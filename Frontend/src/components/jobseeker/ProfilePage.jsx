import React, { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  BriefcaseBusiness,
  GraduationCap,
  FileText,
  Pencil,
  Camera,
  Save,
  X,
  Upload,
  CheckCircle2,
  Loader2,
  Building2,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Target,
  Lightbulb,
  AlertCircle,
  WandSparkles,
  Brain,
} from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function JobseekerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // =====================================================
  // AI STATES
  // =====================================================

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");

  const [improvingExperience, setImprovingExperience] = useState(null);
  const [aiExperienceResult, setAiExperienceResult] = useState({});

  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    totalExperience: "",
    ctc: "",
    location: "",
    skills: "",
    education: [],
    experience: [],
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:8000/api/profile/jobseeker",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load profile");
        return;
      }

      const userProfile = data.profile;

      setProfile(userProfile);

      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        age: userProfile.age || "",
        totalExperience: userProfile.totalExperience || "",
        ctc: userProfile.ctc || "",
        location: userProfile.location || "",
        skills: userProfile.skills?.join(", ") || "",
        education: userProfile.education || [],
        experience: userProfile.experience || [],
      });

      if (userProfile.profileImage) {
        setPreview(
          `http://localhost:8000${userProfile.profileImage}`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Server error while loading profile");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMMON INPUT HANDLER
  // =====================================================

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // =====================================================
  // RESUME
  // =====================================================

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    setResumeFile(file);
  };

  // =====================================================
  // EDUCATION
  // =====================================================

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          degree: "",
          institution: "",
          year: "",
          duration: "",
        },
      ],
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData((prev) => {
      const updatedEducation = [...(prev.education || [])];

      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };

      return {
        ...prev,
        education: updatedEducation,
      };
    });
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =====================================================
  // EXPERIENCE
  // =====================================================

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          role: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData((prev) => {
      const updatedExperience = [
        ...(prev.experience || []),
      ];

      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      };

      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =====================================================
  // AI PROFILE ANALYZER
  // =====================================================

  const handleAIAnalysis = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setShowAIAnalysis(true);

      const profileData = {
        name: profile?.name || formData.name,
        email: profile?.email || formData.email,
        phone: profile?.phone || formData.phone,
        age: profile?.age || formData.age,
        totalExperience:
          profile?.totalExperience ||
          formData.totalExperience,
        location:
          profile?.location || formData.location,
        skills:
          profile?.skills ||
          formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        education:
          profile?.education ||
          formData.education,
        experience:
          profile?.experience ||
          formData.experience,
        resume: profile?.resume || null,
      };

      const res = await fetch(
        "http://localhost:8000/api/ai/profile-analysis",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "AI analysis failed"
        );
      }

      setAiResult(data.analysis);

      toast.success("AI profile analysis completed!");
    } catch (err) {
      console.error("AI Profile Analysis:", err);

      setAiError(
        err.message ||
          "Unable to analyze your profile"
      );

      toast.error(
        err.message ||
          "AI analysis failed"
      );
    } finally {
      setAiLoading(false);
    }
  };

  // =====================================================
  // AI EXPERIENCE IMPROVER
  // =====================================================

  const handleImproveExperience = async (index) => {
    const experience =
      formData.experience?.[index];

    if (!experience) return;

    if (!experience.description?.trim()) {
      toast.warning(
        "Please write something in the description first."
      );
      return;
    }

    try {
      setImprovingExperience(index);

      const res = await fetch(
        "http://localhost:8000/api/ai/improve-experience",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role:
              experience.role ||
              experience.position ||
              experience.title ||
              "",
            company:
              experience.company || "",
            description:
              experience.description || "",
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to improve experience"
        );
      }

      setAiExperienceResult((prev) => ({
        ...prev,
        [index]:
          data.improvedDescription ||
          data.result ||
          "",
      }));

      toast.success(
        "Experience improved with AI!"
      );
    } catch (err) {
      console.error(
        "AI Experience Error:",
        err
      );

      toast.error(
        err.message ||
          "AI experience improvement failed"
      );
    } finally {
      setImprovingExperience(null);
    }
  };

  // =====================================================
  // USE AI EXPERIENCE RESULT
  // =====================================================

  const useAIExperience = (index) => {
    const improved =
      aiExperienceResult[index];

    if (!improved) return;

    updateExperience(
      index,
      "description",
      improved
    );

    toast.success(
      "AI suggestion added to description"
    );
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      // PROFILE IMAGE

      if (profileImage) {
        const fd = new FormData();

        fd.append(
          "profileImage",
          profileImage
        );

        const imageRes = await fetch(
          "http://localhost:8000/api/profile/jobseeker/image",
          {
            method: "POST",
            credentials: "include",
            body: fd,
          }
        );

        if (!imageRes.ok) {
          const imageData =
            await imageRes.json();

          throw new Error(
            imageData.message ||
              "Profile image upload failed"
          );
        }
      }

      // RESUME

      if (resumeFile) {
        const fd = new FormData();

        fd.append("resume", resumeFile);

        const resumeRes = await fetch(
          "http://localhost:8000/api/profile/jobseeker/resume",
          {
            method: "POST",
            credentials: "include",
            body: fd,
          }
        );

        if (!resumeRes.ok) {
          const resumeData =
            await resumeRes.json();

          throw new Error(
            resumeData.message ||
              "Resume upload failed"
          );
        }
      }

      // PROFILE DATA

      const payload = {
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
        totalExperience:
          formData.totalExperience,
        ctc: formData.ctc,
        location: formData.location,

        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        education:
          formData.education,

        experience:
          formData.experience,
      };

      const res = await fetch(
        "http://localhost:8000/api/profile/jobseeker",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Profile update failed"
        );
      }

      setProfile(data.profile);

      setFormData({
        name: data.profile.name || "",
        email: data.profile.email || "",
        phone: data.profile.phone || "",
        age: data.profile.age || "",
        totalExperience:
          data.profile.totalExperience ||
          "",
        ctc: data.profile.ctc || "",
        location:
          data.profile.location || "",
        skills:
          data.profile.skills?.join(
            ", "
          ) || "",
        education:
          data.profile.education || [],
        experience:
          data.profile.experience || [],
      });

      setEditing(false);
      setProfileImage(null);
      setResumeFile(null);

      if (data.profile.profileImage) {
        setPreview(
          `http://localhost:8000${data.profile.profileImage}`
        );
      }

      toast.success(
        "Profile updated successfully!"
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.message ||
          "Profile update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      age: profile.age || "",
      totalExperience:
        profile.totalExperience || "",
      ctc: profile.ctc || "",
      location:
        profile.location || "",
      skills:
        profile.skills?.join(", ") || "",
      education:
        profile.education || [],
      experience:
        profile.experience || [],
    });

    setProfileImage(null);
    setResumeFile(null);

    if (profile.profileImage) {
      setPreview(
        `http://localhost:8000${profile.profileImage}`
      );
    } else {
      setPreview(null);
    }

    setEditing(false);
  };

  // =====================================================
  // PROFILE COMPLETION
  // =====================================================

  const getProfileCompletion = () => {
    if (!profile) return 0;

    const checks = [
      profile.profileImage,
      profile.name,
      profile.email,
      profile.phone,
      profile.location,
      profile.age,
      profile.skills?.length > 0,
      profile.education?.length > 0,
      profile.experience?.length > 0,
      profile.resume,
    ];

    const completed =
      checks.filter(Boolean).length;

    return Math.round(
      (completed / checks.length) * 100
    );
  };

  const completion =
    getProfileCompletion();

  const skills =
    profile?.skills || [];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dee4f1]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 border-t-indigo-600">
              <Loader2
                size={22}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#dee4f1]">
        <div className="mx-auto flex min-h-[70vh] max-w-[600px] items-center justify-center px-5">
          <div className="w-full rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <X size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchProfile}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#dee4f1] flex items-center justify-center">
        <p className="text-slate-500">
          No profile found.
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <div className="min-h-screen bg-[#dee4f1]">
        <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1180px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-indigo-600">
                  Job Seeker
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  My Profile
                </h1>

                <p className="mt-1.5 text-sm text-slate-500">
                  Manage your professional information,
                  education, experience and resume.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                {/* AI BUTTON */}

                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={aiLoading}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-violet-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-violet-700
                    shadow-sm
                    transition
                    hover:border-violet-300
                    hover:bg-violet-50
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {aiLoading ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Sparkles size={15} />
                  )}

                  {aiLoading
                    ? "Analyzing..."
                    : "Analyze with AI"}
                </button>

                {!editing && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditing(true)
                    }
                    className="
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-indigo-600
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-indigo-700
                      hover:shadow-md
                    "
                  >
                    <Pencil size={15} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                AI PROFILE ANALYSIS
            ================================================= */}

            {showAIAnalysis && (
              <section className="mb-5 overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">

                {/* AI HEADER */}

                <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 via-indigo-50 to-white px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                        <Brain size={21} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">
                            AI Profile Analysis
                          </h2>

                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                            AI
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Personalized insights to improve your job profile.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAIAnalysis(false)
                      }
                      className="self-end rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 sm:self-auto"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">

                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
                        <Sparkles
                          size={25}
                          className="animate-pulse text-violet-600"
                        />
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-700">
                        AI is analyzing your profile...
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Checking skills, education and experience
                      </p>
                    </div>
                  ) : aiError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                      <div className="flex gap-3">
                        <AlertCircle
                          size={19}
                          className="mt-0.5 shrink-0 text-red-500"
                        />

                        <div>
                          <p className="text-sm font-bold text-red-700">
                            AI analysis failed
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            {aiError}
                          </p>

                          <button
                            type="button"
                            onClick={handleAIAnalysis}
                            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : aiResult ? (
                    <AIAnalysisContent
                      analysis={aiResult}
                    />
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-400">
                      Click Analyze with AI to get your profile insights.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                PROFILE SUMMARY CARD
            ================================================= */}

            <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr_315px]">

                {/* PROFILE PHOTO */}

                <div className="flex items-center justify-center px-6 py-8">
                  <div className="relative">

                    <div
                      className="flex h-[150px] w-[150px] items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(
                          #f59e0b 0deg ${
                            completion * 3.6
                          }deg,
                          #e5e7eb ${
                            completion * 3.6
                          }deg 360deg
                        )`,
                      }}
                    >
                      <div className="flex h-[138px] w-[138px] items-center justify-center rounded-full bg-white">
                        <div className="relative flex h-[126px] w-[126px] items-center justify-center overflow-hidden rounded-full bg-slate-500">

                          {preview ? (
                            <img
                              src={preview}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-white">
                              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <UserRound size={22} />
                              </div>

                              <span className="text-sm font-semibold">
                                Add photo
                              </span>
                            </div>
                          )}

                          {editing && (
                            <label
                              htmlFor="profile-photo"
                              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/35 opacity-0 transition hover:opacity-100"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md">
                                <Camera size={18} />
                              </div>

                              <input
                                id="profile-photo"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={
                                  handleImageChange
                                }
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                      <div className="rounded-full border border-slate-100 bg-white px-4 py-1 text-xs font-bold text-amber-600 shadow-sm">
                        {completion}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROFILE INFORMATION */}

                <div className="px-6 py-7 lg:border-l lg:border-slate-100 lg:px-7">

                  <div className="flex items-center gap-2">
                    <h2 className="text-[26px] font-bold tracking-tight text-slate-900">
                      {profile?.name ||
                        "Your Name"}
                    </h2>

                    {!editing && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditing(true)
                        }
                        className="text-slate-400 transition hover:text-indigo-600"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </div>

                  <p className="mt-1 text-base font-semibold text-slate-600">
                    {profile?.education?.[0]
                      ?.degree ||
                      profile?.education?.[0]
                        ?.course ||
                      "B.Tech / B.E."}
                  </p>

                  <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
                    {profile?.education?.[0]
                      ?.institution ||
                      profile?.education?.[0]
                        ?.college ||
                      profile?.education?.[0]
                        ?.school ||
                      "College / University not added"}
                  </p>

                  <div className="my-5 h-px bg-slate-200" />

                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">

                    <ProfileDetail
                      icon={<MapPin size={16} />}
                      value={
                        profile?.location ||
                        "Location not added"
                      }
                    />

                    <ProfileDetail
                      icon={<Phone size={16} />}
                      value={
                        profile?.phone ||
                        "Phone not added"
                      }
                      verified={Boolean(
                        profile?.phone
                      )}
                    />

                    <ProfileDetail
                      icon={<UserRound size={16} />}
                      value={
                        profile?.gender ||
                        "Gender not added"
                      }
                    />

                    <ProfileDetail
                      icon={<Mail size={16} />}
                      value={
                        profile?.email ||
                        "Email not available"
                      }
                      verified={Boolean(
                        profile?.email
                      )}
                    />

                    <ProfileDetail
                      icon={
                        <CalendarDays
                          size={16}
                        />
                      }
                      value={
                        profile?.dateOfBirth ||
                        profile?.dob ||
                        (profile?.age
                          ? `${profile.age} years`
                          : "Age not added")
                      }
                    />
                  </div>
                </div>

                {/* PROFILE STATUS */}

                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-7 lg:border-l lg:border-t-0">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Profile Status
                      </p>

                      <p className="text-xs text-slate-400">
                        Your profile is active
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Profile completion
                      </span>

                      <span className="text-xs font-bold text-indigo-600">
                        {completion}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{
                          width: `${completion}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4">
                    <div className="flex gap-3">
                      <Sparkles
                        size={17}
                        className="mt-0.5 shrink-0 text-violet-600"
                      />

                      <div>
                        <p className="text-xs font-bold text-violet-800">
                          Improve your profile
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-violet-600">
                          Use AI to find missing skills and improve your profile.
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleAIAnalysis
                          }
                          className="mt-2 text-xs font-bold text-violet-700 hover:text-violet-900"
                        >
                          Analyze now →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                EDIT ACTION BAR
            ================================================= */}

            {editing && (
              <div className="mb-5 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Editing your profile
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Update your information and save your changes.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <X size={15} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <SectionHeader
                icon={<UserRound size={17} />}
                iconClass="bg-indigo-50 text-indigo-600"
                title="Basic Information"
                subtitle="Your personal and professional details"
              />

              {!editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2">

                  <InfoItem
                    icon={
                      <CalendarDays size={16} />
                    }
                    label="Age"
                    value={
                      profile?.age ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={
                      <BriefcaseBusiness
                        size={16}
                      />
                    }
                    label="Experience"
                    value={
                      profile?.totalExperience ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={<Phone size={16} />}
                    label="Phone"
                    value={
                      profile?.phone ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={
                      <BriefcaseBusiness
                        size={16}
                      />
                    }
                    label="Current CTC"
                    value={
                      profile?.ctc ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="Location"
                    value={
                      profile?.location ||
                      "Not specified"
                    }
                  />

                  <InfoItem
                    icon={<Mail size={16} />}
                    label="Email"
                    value={
                      profile?.email ||
                      "Not specified"
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                  <FormInput
                    label="Full Name"
                    value={formData.name}
                    placeholder="Enter your full name"
                    onChange={(value) =>
                      handleChange(
                        "name",
                        value
                      )
                    }
                  />

                  <FormInput
                    label="Email"
                    value={formData.email}
                    disabled
                  />

                  <FormInput
                    label="Phone"
                    value={formData.phone}
                    placeholder="Enter phone number"
                    onChange={(value) =>
                      handleChange(
                        "phone",
                        value
                      )
                    }
                  />

                  <FormInput
                    label="Age"
                    value={formData.age}
                    placeholder="Enter age"
                    onChange={(value) =>
                      handleChange(
                        "age",
                        value
                      )
                    }
                  />

                  <FormInput
                    label="Total Experience"
                    value={
                      formData.totalExperience
                    }
                    placeholder="e.g. 2 years"
                    onChange={(value) =>
                      handleChange(
                        "totalExperience",
                        value
                      )
                    }
                  />

                  <FormInput
                    label="Current CTC"
                    value={formData.ctc}
                    placeholder="e.g. 5 LPA"
                    onChange={(value) =>
                      handleChange(
                        "ctc",
                        value
                      )
                    }
                  />

                  <FormInput
                    label="Location"
                    value={formData.location}
                    placeholder="e.g. Bhopal, India"
                    onChange={(value) =>
                      handleChange(
                        "location",
                        value
                      )
                    }
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Skills
                    </label>

                    <input
                      value={formData.skills}
                      onChange={(e) =>
                        handleChange(
                          "skills",
                          e.target.value
                        )
                      }
                      placeholder="React, Node.js, MongoDB..."
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />

                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Separate skills with commas.
                    </p>
                  </div>

                  {/* EDUCATION */}

                  <div className="border-t border-slate-200 pt-6 sm:col-span-2">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <GraduationCap
                            size={17}
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Education
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Add your academic qualifications
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addEducation}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Plus size={14} />
                        Add Education
                      </button>
                    </div>

                    <div className="space-y-4">

                      {formData.education?.length ===
                        0 && (
                        <EmptySection
                          icon={
                            <GraduationCap
                              size={21}
                            />
                          }
                          text="No education added yet."
                        />
                      )}

                      {formData.education?.map(
                        (education, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                          >
                            <div className="mb-4 flex items-center justify-between">

                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-700">
                                  {index + 1}
                                </span>

                                <p className="text-sm font-bold text-slate-700">
                                  Education
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeEducation(
                                    index
                                  )
                                }
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={13} />
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                              <FormInput
                                label="Degree / Course"
                                value={
                                  education.degree ||
                                  education.course ||
                                  ""
                                }
                                placeholder="B.Tech CSE"
                                onChange={(value) =>
                                  updateEducation(
                                    index,
                                    "degree",
                                    value
                                  )
                                }
                              />

                              <FormInput
                                label="Institution"
                                value={
                                  education.institution ||
                                  education.school ||
                                  education.college ||
                                  ""
                                }
                                placeholder="College / University"
                                onChange={(value) =>
                                  updateEducation(
                                    index,
                                    "institution",
                                    value
                                  )
                                }
                              />

                              <FormInput
                                label="Year"
                                value={
                                  education.year ||
                                  ""
                                }
                                placeholder="2027"
                                onChange={(value) =>
                                  updateEducation(
                                    index,
                                    "year",
                                    value
                                  )
                                }
                              />

                              <FormInput
                                label="Duration"
                                value={
                                  education.duration ||
                                  ""
                                }
                                placeholder="2023 - 2027"
                                onChange={(value) =>
                                  updateEducation(
                                    index,
                                    "duration",
                                    value
                                  )
                                }
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* EXPERIENCE */}

                  <div className="border-t border-slate-200 pt-6 sm:col-span-2">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Building2 size={17} />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Experience
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Add your professional experience
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addExperience}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Plus size={14} />
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-4">

                      {formData.experience?.length ===
                        0 && (
                        <EmptySection
                          icon={
                            <BriefcaseBusiness
                              size={21}
                            />
                          }
                          text="No experience added yet."
                        />
                      )}

                      {formData.experience?.map(
                        (experience, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                          >
                            <div className="mb-4 flex items-center justify-between">

                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-700">
                                  {index + 1}
                                </span>

                                <p className="text-sm font-bold text-slate-700">
                                  Experience
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeExperience(
                                    index
                                  )
                                }
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={13} />
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                              <FormInput
                                label="Job Title / Role"
                                value={
                                  experience.role ||
                                  experience.position ||
                                  experience.title ||
                                  ""
                                }
                                placeholder="Frontend Developer"
                                onChange={(value) =>
                                  updateExperience(
                                    index,
                                    "role",
                                    value
                                  )
                                }
                              />

                              <FormInput
                                label="Company"
                                value={
                                  experience.company ||
                                  ""
                                }
                                placeholder="Company Name"
                                onChange={(value) =>
                                  updateExperience(
                                    index,
                                    "company",
                                    value
                                  )
                                }
                              />

                              <FormInput
                                label="Start Date"
                                value={
                                  experience.startDate ||
                                  ""
                                }
                                placeholder="Jan 2025"
                                onChange={(value) =>
                                  updateExperience(
                                    index,
                                    "startDate",
                                    value
                                  )
                                }
                              />

                              <FormInput
                                label="End Date"
                                value={
                                  experience.endDate ||
                                  ""
                                }
                                placeholder="Present"
                                onChange={(value) =>
                                  updateExperience(
                                    index,
                                    "endDate",
                                    value
                                  )
                                }
                              />

                              <div className="sm:col-span-2">

                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <label className="block text-xs font-semibold text-slate-600">
                                    Description
                                  </label>

                                  {/* AI IMPROVE BUTTON */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleImproveExperience(
                                        index
                                      )
                                    }
                                    disabled={
                                      improvingExperience ===
                                      index
                                    }
                                    className="
                                      inline-flex
                                      h-8
                                      items-center
                                      justify-center
                                      gap-1.5
                                      rounded-lg
                                      border
                                      border-violet-200
                                      bg-violet-50
                                      px-3
                                      text-[11px]
                                      font-bold
                                      text-violet-700
                                      transition
                                      hover:bg-violet-100
                                      disabled:opacity-60
                                    "
                                  >
                                    {improvingExperience ===
                                    index ? (
                                      <>
                                        <Loader2
                                          size={13}
                                          className="animate-spin"
                                        />
                                        Improving...
                                      </>
                                    ) : (
                                      <>
                                        <WandSparkles
                                          size={13}
                                        />
                                        Improve with AI
                                      </>
                                    )}
                                  </button>
                                </div>

                                <textarea
                                  value={
                                    experience.description ||
                                    ""
                                  }
                                  placeholder="Describe your responsibilities, projects and achievements..."
                                  rows={4}
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                />

                                {/* AI RESULT */}

                                {aiExperienceResult[
                                  index
                                ] && (
                                  <div className="mt-3 overflow-hidden rounded-xl border border-violet-200 bg-white">

                                    <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50/70 px-4 py-3">

                                      <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                          <Sparkles
                                            size={14}
                                          />
                                        </div>

                                        <p className="text-xs font-bold text-violet-800">
                                          AI Improved Version
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAiExperienceResult(
                                            (prev) => {
                                              const copy = {
                                                ...prev,
                                              };

                                              delete copy[
                                                index
                                              ];

                                              return copy;
                                            }
                                          )
                                        }
                                        className="text-slate-400 hover:text-slate-600"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>

                                    <div className="p-4">
                                      <p className="text-sm leading-6 text-slate-600">
                                        {
                                          aiExperienceResult[
                                            index
                                          ]
                                        }
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          useAIExperience(
                                            index
                                          )
                                        }
                                        className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
                                      >
                                        <CheckCircle2
                                          size={14}
                                        />
                                        Use This Version
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* =================================================
                SKILLS
            ================================================= */}

            {!editing && (
              <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <Target size={17} />
                  }
                  iconClass="bg-violet-50 text-violet-600"
                  title="Skills"
                  subtitle="Technologies and skills you have"
                />

                <div className="p-5 sm:p-6">

                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">

                      {skills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                EDUCATION DISPLAY
            ================================================= */}

            <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <GraduationCap size={17} />
                }
                iconClass="bg-blue-50 text-blue-600"
                title="Education"
                subtitle="Academic background"
              />

              <div className="p-5 sm:p-6">

                {profile?.education?.length > 0 ? (
                  <div className="space-y-5">

                    {profile.education.map(
                      (education, index) => (
                        <div
                          key={index}
                          className="relative border-l-2 border-blue-200 pl-5"
                        >
                          <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />

                          <h4 className="text-sm font-bold text-slate-800">
                            {education.degree ||
                              education.course ||
                              "Education"}
                          </h4>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {education.institution ||
                              education.school ||
                              education.college ||
                              "Institution not specified"}
                          </p>

                          {(education.year ||
                            education.duration) && (
                            <p className="mt-1 text-xs text-slate-400">
                              {education.year ||
                                education.duration}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <EmptySection
                    icon={
                      <GraduationCap size={21} />
                    }
                    text="No education details added yet."
                  />
                )}
              </div>
            </section>

            {/* =================================================
                EXPERIENCE DISPLAY
            ================================================= */}

            <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <Building2 size={17} />
                }
                iconClass="bg-emerald-50 text-emerald-600"
                title="Experience"
                subtitle="Your professional experience"
              />

              <div className="p-5 sm:p-6">

                {profile?.experience?.length > 0 ? (
                  <div className="space-y-5">

                    {profile.experience.map(
                      (experience, index) => (
                        <div
                          key={index}
                          className="relative border-l-2 border-emerald-200 pl-5"
                        >
                          <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />

                          <h4 className="text-sm font-bold text-slate-800">
                            {experience.role ||
                              experience.position ||
                              experience.title ||
                              "Position"}
                          </h4>

                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {experience.company ||
                              "Company not specified"}
                          </p>

                          {(experience.duration ||
                            experience.startDate ||
                            experience.endDate) && (
                            <p className="mt-1 text-xs text-slate-400">
                              {experience.duration ||
                                `${
                                  experience.startDate ||
                                  ""
                                } - ${
                                  experience.endDate ||
                                  "Present"
                                }`}
                            </p>
                          )}

                          {experience.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {experience.description}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <EmptySection
                    icon={
                      <BriefcaseBusiness
                        size={21}
                      />
                    }
                    text="No experience details added yet."
                  />
                )}
              </div>
            </section>

            {/* =================================================
                RESUME
            ================================================= */}

            <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <SectionHeader
                icon={
                  <FileText size={17} />
                }
                iconClass="bg-rose-50 text-rose-600"
                title="Resume"
                subtitle="Keep your resume updated for applications"
              />

              <div className="p-5 sm:p-6">

                {editing ? (
                  <label className="flex cursor-pointer flex-col gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/30 sm:flex-row sm:items-center">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <Upload size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {resumeFile
                          ? resumeFile.name
                          : "Upload new resume"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        PDF or Word document
                      </p>
                    </div>

                    <span className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm">
                      <Upload size={14} />
                      Choose File
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={
                        handleResumeChange
                      }
                    />
                  </label>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <FileText size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Resume
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {profile?.resume
                            ? "Resume uploaded successfully"
                            : "No resume uploaded"}
                        </p>
                      </div>
                    </div>

                    {profile?.resume && (
                      <a
                        href={`http://localhost:8000${profile.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <ExternalLink
                          size={14}
                        />
                        View Resume
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                BOTTOM SAVE BAR
            ================================================= */}

            {editing && (
              <div className="sticky bottom-4 z-20 mt-6">

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">

                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-700">
                      Ready to save?
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Your profile changes will be updated.
                    </p>
                  </div>

                  <div className="flex w-full gap-2 sm:w-auto">

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                    >
                      <X size={15} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:opacity-60 sm:flex-none"
                    >
                      {saving ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

// =========================================================
// AI ANALYSIS COMPONENT
// =========================================================

function AIAnalysisContent({ analysis }) {
  const score = Number(
    analysis?.score ||
      analysis?.profileScore ||
      0
  );

  const strengths =
    analysis?.strengths || [];

  const weaknesses =
    analysis?.weaknesses ||
    analysis?.areasToImprove ||
    [];

  const missingSkills =
    analysis?.missingSkills ||
    analysis?.recommendedSkills ||
    [];

  const suggestions =
    analysis?.suggestions ||
    analysis?.improvements ||
    [];

  const recommendedRoles =
    analysis?.recommendedRoles ||
    analysis?.jobRoles ||
    [];

  return (
    <div className="space-y-5">

      {/* SCORE */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[190px_1fr]">

        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 text-center">

          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
            Profile Score
          </p>

          <div className="mt-3 text-4xl font-black text-slate-900">
            {score}
            <span className="text-lg text-slate-400">
              /100
            </span>
          </div>

          <div className="mx-auto mt-4 h-2 max-w-[130px] overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              style={{
                width: `${Math.min(
                  Math.max(score, 0),
                  100
                )}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs font-semibold text-violet-700">
            {score >= 80
              ? "Strong Profile"
              : score >= 60
              ? "Good Profile"
              : "Needs Improvement"}
          </p>
        </div>

        {/* AI SUMMARY */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">

          <div className="flex items-center gap-2">
            <Lightbulb
              size={17}
              className="text-amber-500"
            />

            <h3 className="text-sm font-bold text-slate-800">
              AI Summary
            </h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {analysis?.summary ||
              analysis?.overview ||
              "Your profile has been analyzed based on your skills, education and experience."}
          </p>
        </div>
      </div>

      {/* THREE COLUMNS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* STRENGTHS */}

        <AIListCard
          icon={
            <CheckCircle2 size={17} />
          }
          iconClass="bg-emerald-50 text-emerald-600"
          title="Your Strengths"
          items={strengths}
          emptyText="No strengths provided."
        />

        {/* WEAKNESSES */}

        <AIListCard
          icon={
            <AlertCircle size={17} />
          }
          iconClass="bg-amber-50 text-amber-600"
          title="Areas to Improve"
          items={weaknesses}
          emptyText="No major issues found."
        />

        {/* MISSING SKILLS */}

        <AIListCard
          icon={
            <Target size={17} />
          }
          iconClass="bg-blue-50 text-blue-600"
          title="Recommended Skills"
          items={missingSkills}
          emptyText="Your skill set looks good."
        />
      </div>

      {/* JOB ROLES */}

      {recommendedRoles.length > 0 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">

          <div className="flex items-center gap-2">
            <BriefcaseBusiness
              size={17}
              className="text-indigo-600"
            />

            <h3 className="text-sm font-bold text-slate-800">
              Recommended Job Roles
            </h3>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recommendedRoles.map(
              (role, index) => (
                <span
                  key={index}
                  className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
                >
                  {role}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* SUGGESTIONS */}

      {suggestions.length > 0 && (
        <div className="rounded-xl border border-violet-100 bg-white p-5">

          <div className="flex items-center gap-2">
            <Sparkles
              size={17}
              className="text-violet-600"
            />

            <h3 className="text-sm font-bold text-slate-800">
              AI Improvement Suggestions
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {suggestions.map(
              (suggestion, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-lg bg-violet-50/60 p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-6 text-slate-600">
                    {suggestion}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// AI LIST CARD
// =========================================================

function AIListCard({
  icon,
  iconClass,
  title,
  items,
  emptyText,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <div className="flex items-center gap-2.5">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>
      </div>

      {items?.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map(
            (item, index) => (
              <div
                key={index}
                className="flex gap-2 text-xs leading-5 text-slate-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>{item}</span>
              </div>
            )
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400">
          {emptyText}
        </p>
      )}
    </div>
  );
}

// =========================================================
// PROFILE DETAIL
// =========================================================

function ProfileDetail({
  icon,
  value,
  verified = false,
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
        {icon}
      </div>

      <span className="truncate text-sm font-medium text-slate-600">
        {value}
      </span>

      {verified && (
        <CheckCircle2
          size={14}
          className="shrink-0 text-emerald-500"
        />
      )}
    </div>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  icon,
  iconClass = "bg-slate-50 text-slate-600",
  title,
  subtitle,
}) {
  return (
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

      <div className="flex items-center gap-3">

        {icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
          >
            {icon}
          </div>
        )}

        <div>
          <h3 className="text-base font-bold text-slate-900">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:px-6">

      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// FORM INPUT
// =========================================================

function FormInput({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        className={`
          h-10
          w-full
          rounded-lg
          border
          border-slate-300
          px-3
          text-sm
          outline-none
          transition
          ${
            disabled
              ? "cursor-not-allowed bg-slate-50 text-slate-400"
              : "bg-white text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          }
        `}
      />
    </div>
  );
}

// =========================================================
// EMPTY SECTION
// =========================================================

function EmptySection({
  icon,
  text,
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center">

      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm">
        {icon}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {text}
      </p>
    </div>
  );
}