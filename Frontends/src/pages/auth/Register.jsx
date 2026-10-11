
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await register({
        name,
        email,
        password: form.password,
        role: form.role,
      });

      toast.success(data.message || "Registration successful!");

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Brand panel */}
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
            Build your future with AI
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight xl:text-6xl">
            Your next chapter
            <span className="block text-violet-300">starts here.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
            Create your account to explore career opportunities, manage your
            hiring journey, and make meaningful professional connections.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Discover opportunities suited to your goals",
              "Keep your career journey organized",
              "Use AI tools to support your preparation",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm text-violet-200">
                  ✓
                </span>
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-slate-400">
          One account. New possibilities.
        </p>
      </section>

      {/* Registration form */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-3 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <BriefcaseBusiness size={21} />
            </span>

            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Career<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <div className="mb-7">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
              Get started for free
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tell us a little about yourself to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-slate-700">
                I want to join as a
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      role: "jobseeker",
                    }))
                  }
                  aria-pressed={form.role === "jobseeker"}
                  className={`rounded-xl border p-4 text-left transition ${
                    form.role === "jobseeker"
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/10"
                      : "border-slate-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <UserRound
                    size={21}
                    className={
                      form.role === "jobseeker"
                        ? "text-violet-600"
                        : "text-slate-400"
                    }
                  />

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Job Seeker
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Find opportunities
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      role: "recruiter",
                    }))
                  }
                  aria-pressed={form.role === "recruiter"}
                  className={`rounded-xl border p-4 text-left transition ${
                    form.role === "recruiter"
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/10"
                      : "border-slate-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <Users
                    size={21}
                    className={
                      form.role === "recruiter"
                        ? "text-violet-600"
                        : "text-slate-400"
                    }
                  />

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Recruiter
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Hire talented people
                  </p>
                </button>
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
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

              <p className="mt-2 text-xs text-slate-400">
                Use at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-violet-200/70 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-violet-600 hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            By creating an account, you agree to use the platform responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}

