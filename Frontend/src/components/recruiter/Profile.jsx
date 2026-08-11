import React, { useEffect, useState } from "react";

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");

  const [websiteError, setWebsiteError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    companyWebsite: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ================= HELPERS ================= */

  const isValidWebsite = (url) => {
    const regex =
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;

    return regex.test(url);
  };

  const isValidPhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone);
  };

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/profile/recruiter",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(
            data.message ||
              "Failed to fetch profile"
          );
          return;
        }

        setProfile(data.profile);

        setFormData({
          name: data.profile.name || "",
          email: data.profile.email || "",
          company: data.profile.company || "",
          companyWebsite:
            data.profile.companyWebsite || "",
          phone: data.profile.phone || "",
        });

        if (data.profile.profileImage) {
          setPreview(
            `http://localhost:8000${data.profile.profileImage}`
          );
        }
      } catch (err) {
        console.log(err);

        setError(
          "Server error while fetching profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPLOAD IMAGE ================= */

  const uploadImage = async () => {
    if (!profileImage) return;

    const fd = new FormData();

    fd.append(
      "profileImage",
      profileImage
    );

    const res = await fetch(
      "http://localhost:8000/api/profile/recruiter/image",
      {
        method: "POST",
        credentials: "include",
        body: fd,
      }
    );

    const data = await res.json();

    if (
      data.message !==
      "Profile image uploaded successfully"
    ) {
      throw new Error(
        data.message ||
          "Image upload failed"
      );
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      setError(null);
      setWebsiteError("");
      setPhoneError("");

      /* Website validation */
      if (
        formData.companyWebsite &&
        !isValidWebsite(
          formData.companyWebsite
        )
      ) {
        setWebsiteError(
          "Enter a valid website (eg: https://company.com)"
        );

        return;
      }

      /* Phone validation */
      if (
        formData.phone &&
        !isValidPhone(formData.phone)
      ) {
        setPhoneError(
          "Enter a valid 10-digit phone number"
        );

        return;
      }

      /* Auto add https */
      let updatedData = {
        ...formData,
      };

      if (
        updatedData.companyWebsite &&
        !updatedData.companyWebsite.startsWith(
          "http://"
        ) &&
        !updatedData.companyWebsite.startsWith(
          "https://"
        )
      ) {
        updatedData.companyWebsite =
          "https://" +
          updatedData.companyWebsite;
      }

      /* Upload image */
      await uploadImage();

      /* Update profile */
      const res = await fetch(
        "http://localhost:8000/api/profile/recruiter",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            updatedData
          ),
        }
      );

      const data = await res.json();

      if (
        data.message !==
        "Profile updated successfully"
      ) {
        setError(
          data.message ||
            "Profile update failed"
        );

        return;
      }

      setProfile(data.profile);

      setFormData({
        name: data.profile.name || "",
        email: data.profile.email || "",
        company:
          data.profile.company || "",
        companyWebsite:
          data.profile.companyWebsite ||
          "",
        phone:
          data.profile.phone || "",
      });

      setEditing(false);

      setProfileImage(null);

      setSuccess(
        "Profile updated successfully!"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Profile update failed"
      );
    }
  };

  /* ================= CANCEL ================= */

  const handleCancel = () => {
    setEditing(false);

    setWebsiteError("");
    setPhoneError("");
    setError(null);

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      company:
        profile.company || "",
      companyWebsite:
        profile.companyWebsite || "",
      phone:
        profile.phone || "",
    });

    if (profile.profileImage) {
      setPreview(
        `http://localhost:8000${profile.profileImage}`
      );
    }

    setProfileImage(null);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-sm text-gray-500">
          No profile found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-5 md:p-7 lg:p-8">

      {/* ================= HEADER ================= */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Recruiter Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your recruiter and company
            information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            className="
              inline-flex
              h-11
              min-w-[135px]
              items-center
              justify-center
              rounded-xl
              bg-black
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-gray-800
              hover:shadow-md
              active:scale-95
            "
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* ================= SUCCESS ================= */}

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
            ✓
          </span>

          {success}
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error && profile && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ================= PROFILE CARD ================= */}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

        {/* ================= LEFT PROFILE ================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col items-center text-center">

            {/* IMAGE */}

            <div className="relative">

              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-lg ring-1 ring-gray-200">

                <img
                  src={
                    preview ||
                    "/default-avatar.png"
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                />

              </div>

              {editing && (
                <label
                  htmlFor="profile-image"
                  className="
                    absolute
                    -bottom-2
                    -right-2
                    flex
                    h-10
                    w-10
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-xl
                    bg-black
                    text-lg
                    text-white
                    shadow-md
                    transition
                    hover:bg-gray-800
                  "
                >
                  +
                </label>
              )}

              {editing && (
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              )}

            </div>

            {/* NAME */}

            <h2 className="mt-5 text-xl font-bold text-black">
              {profile.name ||
                "Recruiter"}
            </h2>

            {/* EMAIL */}

            <p className="mt-1 break-all text-sm text-gray-500">
              {profile.email}
            </p>

            {/* COMPANY */}

            {profile.company && (
             <div className="mt-4 inline-flex min-w-[150px] min-h-[40px] items-center justify-center rounded-xl border border-gray-200 bg-gray-100 px-5 py-2.5 text-center text-sm font-semibold text-gray-800">
  {profile.company}
</div>
            )}

            {/* EDIT IMAGE INFO */}

            {editing && (
              <p className="mt-4 text-xs text-gray-400">
                Click + to change profile
                picture
              </p>
            )}

          </div>

        </div>

        {/* ================= RIGHT DETAILS ================= */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="border-b border-gray-200 px-6 py-5">

            <h2 className="text-lg font-bold text-black">
              {editing
                ? "Edit Information"
                : "Profile Information"}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {editing
                ? "Update your recruiter and company details."
                : "Your current recruiter account details."}
            </p>

          </div>

          {/* ================= VIEW MODE ================= */}

          {!editing ? (
            <div className="grid gap-5 p-6 sm:grid-cols-2">

              {/* NAME */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="mt-2 text-sm font-bold text-black">
                  {profile.name ||
                    "Not provided"}
                </p>
              </div>

              {/* EMAIL */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-bold text-black">
                  {profile.email ||
                    "Not provided"}
                </p>
              </div>

              {/* COMPANY */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Company
                </p>

                <p className="mt-2 text-sm font-bold text-black">
                  {profile.company ||
                    "Not provided"}
                </p>
              </div>

              {/* WEBSITE */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Company Website
                </p>

                {profile.companyWebsite ? (
                  <a
                    href={
                      profile.companyWebsite
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block truncate text-sm font-bold text-black underline decoration-gray-300 underline-offset-4 transition hover:decoration-black"
                  >
                    {
                      profile.companyWebsite
                    }
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-bold text-gray-400">
                    Not provided
                  </p>
                )}

              </div>

              {/* PHONE */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 sm:col-span-2">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Phone
                </p>

                <p className="mt-2 text-sm font-bold text-black">
                  {profile.phone ||
                    "Not provided"}
                </p>

              </div>

            </div>
          ) : (

            /* ================= EDIT MODE ================= */

            <div className="p-6">

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
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

                {/* EMAIL */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Email
                  </label>

                  <input
                    name="email"
                    value={
                      formData.email
                    }
                    readOnly
                    className="
                      mt-2
                      h-12
                      w-full
                      cursor-not-allowed
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-100
                      px-4
                      text-sm
                      text-gray-500
                      outline-none
                    "
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Email cannot be changed.
                  </p>
                </div>

                {/* COMPANY */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Company
                  </label>

                  <input
                    name="company"
                    value={
                      formData.company
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Company name"
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

                {/* WEBSITE */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Company Website
                  </label>

                  <input
                    name="companyWebsite"
                    value={
                      formData.companyWebsite
                    }
                    onChange={(e) => {
                      setFormData(
                        (prev) => ({
                          ...prev,
                          companyWebsite:
                            e.target.value,
                        })
                      );

                      setWebsiteError(
                        ""
                      );
                    }}
                    placeholder="https://company.com"
                    className={`
                      mt-2
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-gray-50
                      px-4
                      text-sm
                      text-black
                      outline-none
                      transition
                      focus:bg-white
                      focus:ring-2
                      ${
                        websiteError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-black focus:ring-black/10"
                      }
                    `}
                  />

                  {websiteError && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {websiteError}
                    </p>
                  )}
                </div>

                {/* PHONE */}

                <div className="md:col-span-2">

                  <label className="text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>

                  <input
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={(e) => {
                      setFormData(
                        (prev) => ({
                          ...prev,
                          phone: e.target.value,
                        })
                      );

                      setPhoneError(
                        ""
                      );
                    }}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    inputMode="numeric"
                    className={`
                      mt-2
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-gray-50
                      px-4
                      text-sm
                      text-black
                      outline-none
                      transition
                      focus:bg-white
                      focus:ring-2
                      ${
                        phoneError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-black focus:ring-black/10"
                      }
                    `}
                  />

                  {phoneError && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {phoneError}
                    </p>
                  )}

                </div>

              </div>

              {/* ================= BUTTONS ================= */}

              <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-6 sm:flex-row">

                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  className="
                    min-w-[120px]
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
                    duration-200
                    hover:border-gray-400
                    hover:bg-gray-100
                    hover:text-black
                    active:scale-95
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  className="
                    min-w-[140px]
                    min-h-[40px]
                    rounded-xl
                    bg-black
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-gray-800
                    hover:shadow-md
                    active:scale-95
                  "
                >
                  Save Changes
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}