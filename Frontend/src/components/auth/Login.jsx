import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";
import bgImage from "../../assets/lg.png";

const Login = ({ setUserRole }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/auth/login",
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

      console.log("Login response:", data);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (!data.role) {
        alert("Login successful but role was not returned.");
        return;
      }

      setUserRole(data.role);

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
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

            {/* Main Text */}

            <div className="max-w-[480px]">

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-300">
                Your career starts here
              </p>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Find the right
                <br />
                opportunity for
                <br />
                your future.
              </h2>

              <p className="mt-5 max-w-[420px] text-sm leading-6 text-gray-300">
                Discover jobs, connect with companies,
                and take the next step toward your career.
              </p>

            </div>

            {/* Bottom */}

            <p className="text-xs text-gray-400">
              © 2026 JobMatchers. All rights reserved.
            </p>

          </div>
        </div>

        {/* ==================================================
            RIGHT LOGIN
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

            {/* Header */}

            <div className="mb-8">

              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black">
                <Lock
                  size={20}
                  className="text-white"
                />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-black">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sign in to continue to your JobMatchers
                account.
              </p>

            </div>

            {/* Form */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">

                  <input
                    id="email"
                    type="email"
                    name="email"
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

              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    placeholder="Enter your password"
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="
                      h-13
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-[#f9fafb]
                      py-3
                      pl-11
                      pr-12
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

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="
                      absolute
                      right-1
                      top-5/12
                      flex
                      h-10
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-black
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Login Button */}

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
                  disabled:hover:translate-y-0
                "
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login

                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </form>

            {/* Register */}

            <div className="mt-7 text-center">

              <p className="text-sm text-gray-500">
                Don't have an account?
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
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
                Create an account
              </button>

            </div>

            {/* Security Text */}

            <div className="mt-8 border-t border-gray-100 pt-5 text-center">

              <p className="text-xs text-gray-400">
                Your account information is securely
                protected.
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;