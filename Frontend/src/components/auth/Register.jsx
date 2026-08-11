import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ChevronDown,
  BriefcaseBusiness,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import bgImage from "../../assets/lg.png";

const Register = () => {
  const [step, setStep] = useState("register");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      console.log("Register response:", data);

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("OTP sent to your email!");
      setStep("verify");
    } catch (err) {
      console.error("Register error:", err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ otp }),
        }
      );

      const data = await res.json();

      console.log("Verify response:", data);

      if (!res.ok) {
        alert(data.message || "Verification failed");
        return;
      }

      alert("Account verified! You can now login.");

      navigate("/login");
    } catch (err) {
      console.error("Verification error:", err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-3 sm:p-5 lg:p-7">

      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1250px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl sm:min-h-[calc(100vh-40px)] lg:grid-cols-2">

        {/* ==================================================
            LEFT IMAGE
        ================================================== */}

        <div
          className="relative hidden bg-cover bg-center lg:block"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        >

          {/* Overlay */}

          <div className="absolute inset-0 bg-black/45" />

          {/* Content */}

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
                <BriefcaseBusiness
                  size={23}
                  strokeWidth={2.4}
                  className="text-black"
                />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Job
                  <span className="text-gray-300">
                    Matchers
                  </span>
                </h1>

                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-gray-300">
                  Find your opportunity
                </p>
              </div>

            </div>

            {/* Main Content */}

            <div className="max-w-[480px]">

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-300">
                Start your journey
              </p>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Build your career.
                <br />
                Find your
                <br />
                opportunity.
              </h2>

              <p className="mt-5 max-w-[420px] text-sm leading-6 text-gray-300">
                Create your account and connect with
                opportunities that match your skills and
                career goals.
              </p>

            </div>

            {/* Bottom */}

            <p className="text-xs text-gray-400">
              © 2026 JobMatchers. All rights reserved.
            </p>

          </div>
        </div>

        {/* ==================================================
            RIGHT FORM
        ================================================== */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">

          <div className="w-full max-w-[440px]">

            {/* Mobile Logo */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black">
                <BriefcaseBusiness
                  size={22}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-lg font-bold text-black">
                  Job
                  <span className="text-gray-500">
                    Matchers
                  </span>
                </h1>

                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-gray-400">
                  Find your opportunity
                </p>
              </div>

            </div>

            {/* ================= REGISTER ================= */}

            {step === "register" && (
              <div>

                {/* Header */}

                <div className="mb-7">

                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black">
                    <User
                      size={20}
                      className="text-white"
                    />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-black">
                    Create an account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Join JobMatchers and start your
                    career journey today.
                  </p>

                </div>

                {/* Form */}

                <form
                  onSubmit={handleRegister}
                  className="space-y-4"
                >

                  {/* Name */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>

                    <div className="relative">

                      <input
                        name="name"
                        value={formData.name}
                        placeholder="Enter your full name"
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        className="
                          h-13
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-[#f9fafb]
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-black
                          outline-none
                          transition-all
                          duration-200
                          placeholder:text-gray-400
                          focus:border-black
                          focus:bg-white
                          focus:ring-4
                          focus:ring-black/5
                        "
                      />

                    </div>

                  </div>

                  {/* Email */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>

                    <div className="relative">

                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        placeholder="Enter your email"
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className="
                          h-13
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-[#f9fafb]
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-black
                          outline-none
                          transition-all
                          duration-200
                          placeholder:text-gray-400
                          focus:border-black
                          focus:bg-white
                          focus:ring-4
                          focus:ring-black/5
                        "
                      />

                    </div>

                  </div>

                  {/* Role */}

                  <div>
  <label className="mb-2 block text-sm font-semibold text-gray-700">
    Account Type
  </label>

  <div className="relative">
    <select
      name="role"
      value={formData.role}
      onChange={handleChange}
      required
      className="
        h-13
        w-full
        appearance-none
        rounded-xl
        border
        border-gray-200
        bg-[#f9fafb]
        py-3
        pl-11
        pr-11
        text-sm
        text-black
        outline-none
        transition-all
        duration-200
        focus:border-black
        focus:bg-white
        focus:ring-4
        focus:ring-black/5
      "
    >
      <option value="">
        Select account type
      </option>

      <option value="jobseeker">
        Job Seeker
      </option>

      <option value="recruiter">
        Recruiter
      </option>
    </select>

    {/* Dropdown Arrow */}
    <ChevronDown
      size={18}
      strokeWidth={2}
      className="
        pointer-events-none
        absolute
        right-4
        top-5/12
        -translate-y-1/2
        text-gray-500
      "
    />
  </div>
</div>

                  {/* Password */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Password
                    </label>

                    <div className="relative">

                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        placeholder="Create a password"
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className="
                          h-13
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-[#f9fafb]
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-black
                          outline-none
                          transition-all
                          duration-200
                          placeholder:text-gray-400
                          focus:border-black
                          focus:bg-white
                          focus:ring-4
                          focus:ring-black/5
                        "
                      />

                    </div>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      mt-2
                      flex
                      h-13
                      w-full
                      items-center
                      justify-center
                      gap-2
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
                      hover:shadow-lg
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account

                        <ArrowRight
                          size={18}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>

                </form>

                {/* Login */}

                <div className="mt-6 text-center">

                  <p className="text-sm text-gray-500">
                    Already have an account?
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-black
                      underline
                      decoration-gray-300
                      underline-offset-4
                      transition
                      hover:decoration-black
                    "
                  >
                    Login
                  </button>

                </div>

              </div>
            )}

            {/* ================= OTP VERIFICATION ================= */}

            {step === "verify" && (
              <div>

                {/* Header */}

                <div className="mb-8">

                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black">
                    <ShieldCheck
                      size={21}
                      className="text-white"
                    />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-black">
                    Verify your email
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    We've sent a verification code to
                  </p>

                  <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">

                    <Mail
                      size={15}
                      className="shrink-0 text-gray-500"
                    />

                    <span className="truncate text-sm font-semibold text-gray-800">
                      {formData.email}
                    </span>

                  </div>

                </div>

                {/* OTP Form */}

                <form
                  onSubmit={handleVerify}
                  className="space-y-5"
                >

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Verification Code
                    </label>

                    <div className="relative">

                      <KeyRound
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        required
                        className="
                          h-14
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-[#f9fafb]
                          px-4
                          pl-12
                          text-center
                          text-lg
                          font-semibold
                          tracking-[0.35em]
                          text-black
                          outline-none
                          transition-all
                          duration-200
                          placeholder:text-sm
                          placeholder:font-normal
                          placeholder:tracking-normal
                          placeholder:text-gray-400
                          focus:border-black
                          focus:bg-white
                          focus:ring-4
                          focus:ring-black/5
                        "
                      />

                    </div>

                  </div>

                  {/* Verify */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      flex
                      h-13
                      w-full
                      items-center
                      justify-center
                      gap-2
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
                      hover:shadow-lg
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Account

                        <ArrowRight
                          size={18}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>

                  {/* Back */}

                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      text-sm
                      font-semibold
                      text-gray-700
                      transition-all
                      duration-200
                      hover:border-gray-300
                      hover:bg-gray-50
                      hover:text-black
                      active:scale-[0.98]
                    "
                  >

                    <ArrowLeft size={17} />

                    Go Back

                  </button>

                </form>

                {/* Security */}

                <div className="mt-7 border-t border-gray-100 pt-5 text-center">

                  <p className="text-xs leading-5 text-gray-400">
                    Your verification code is valid for
                    a limited time.
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;