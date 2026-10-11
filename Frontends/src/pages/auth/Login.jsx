import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await login({
        email,
        password,
      });

      // Read the role returned by the existing AuthContext login method.
      const role = data?.role || data?.user?.role;

      if (!role) {
        toast.error(
          "Login response did not contain a user role. Please check AuthContext."
        );
        return;
      }

      toast.success(data?.message || "Login successful!");

      // Redirect to the originally requested page when possible.
      const requestedPath = location.state?.from;
      const requestedUrl =
        requestedPath?.pathname &&
        requestedPath.pathname !== "/login" &&
        requestedPath.pathname !== "/register"
          ? requestedPath.pathname
          : null;

      if (requestedUrl) {
        navigate(requestedUrl, { replace: true });
        return;
      }

      if (role === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else if (role === "jobseeker") {
        navigate("/jobseeker/dashboard", { replace: true });
      } else {
        toast.error("Your account role is not recognized.");
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast.error(
        error?.message || "Unable to log in. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left promotional section */}
      <section className="relative hidden overflow-hidden bg-[#17152f] px-12 py-12 text-white lg:flex lg:flex-col xl:px-20">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500">
            <BriefcaseBusiness size={23} />
          </div>

          <span className="text-xl font-extrabold tracking-tight">
            Career<span className="text-violet-300">AI</span>
          </span>
        </Link>

        <div className="relative my-auto max-w-xl py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-violet-200">
            <Sparkles size={16} />
            Your next opportunity starts here
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight xl:text-6xl">
            Make your next
            <span className="block text-violet-300">career move.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
            Find meaningful opportunities, manage your applications, and
            connect your skills with the right career path.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Sparkles className="mb-3 text-violet-300" size={22} />
              <p className="font-bold">AI-powered tools</p>
              <p className="mt-1 text-sm text-slate-400">
                Support for your career journey
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <BriefcaseBusiness
                className="mb-3 text-violet-300"
                size={22}
              />
              <p className="font-bold">Career opportunities</p>
              <p className="mt-1 text-sm text-slate-400">
                Explore jobs that fit your goals
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-slate-400">
          Your skills. Your ambitions. Your next chapter.
        </p>
      </section>

      {/* Login form */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-3 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <BriefcaseBusiness size={21} />
            </span>

            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Career<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
              Welcome back
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your details to continue to your career dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-violet-200/70 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-violet-600 hover:text-violet-700"
            >
              Create account
            </Link>
          </p>

          <div className="mt-10 border-t border-slate-100 pt-5 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 transition hover:text-violet-600"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
