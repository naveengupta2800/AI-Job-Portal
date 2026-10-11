
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileText,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Target,
    title: "Smart job matching",
    description:
      "Discover opportunities aligned with your skills, interests, and career goals.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: FileText,
    title: "Resume intelligence",
    description:
      "Improve your profile and understand where your skills can take you next.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Application tracking",
    description:
      "Keep track of your applications and stay organized throughout hiring.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const categories = [
  { name: "Software Development", icon: Code2, count: "Engineering" },
  { name: "Artificial Intelligence", icon: Cpu, count: "AI & Data" },
  { name: "Product & Design", icon: Sparkles, count: "Creative" },
  { name: "Business & Operations", icon: BriefcaseBusiness, count: "Business" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Navigation */}
      <header className="relative z-20 border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
              <BriefcaseBusiness size={21} />
            </span>

            <span className="text-xl font-extrabold tracking-tight">
              Career<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-violet-600"
            >
              Features
            </a>
            <a
              href="#categories"
              className="text-sm font-medium text-slate-600 transition hover:text-violet-600"
            >
              Career paths
            </a>
            <Link
              to="/jobs"
              className="text-sm font-medium text-slate-600 transition hover:text-violet-600"
            >
              Explore jobs
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
            >
              Get started <ArrowUpRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 sm:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white p-5 shadow-xl sm:hidden">
            <nav className="flex flex-col gap-2">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Features
              </a>
              <a
                href="#categories"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Career paths
              </a>
              <Link
                to="/jobs"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Explore jobs
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Create account
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative isolate bg-[#faf9ff]">
        <div className="pointer-events-none absolute -right-32 -top-20 -z-10 h-[440px] w-[440px] rounded-full bg-violet-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 -z-10 h-[340px] w-[340px] rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:px-10 lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 shadow-sm">
              <Sparkles size={15} className="text-violet-600" />
              <span className="text-xs font-bold tracking-wide text-violet-800 sm:text-sm">
                A smarter way to build your career
              </span>
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-6xl xl:text-[68px]">
              Your potential deserves
              <span className="block text-violet-600">the right opportunity.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Find meaningful jobs, put your skills forward, and manage your
              career journey with intelligent tools built for your next move.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mt-9 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-violet-100/60 sm:p-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2 sm:px-4">
                  <Search
                    size={20}
                    className="shrink-0 text-violet-600"
                  />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Job title, skill or keyword"
                    aria-label="Job title, skill or keyword"
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="hidden h-9 w-px bg-slate-200 sm:block" />

                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2 sm:px-4">
                  <Target size={19} className="shrink-0 text-slate-400" />
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="City or location"
                    aria-label="Job location"
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 sm:py-4"
                >
                  Search jobs <ArrowRight size={17} />
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                Career tools in one place
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Built for candidates and recruiters
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute -right-3 top-8 h-24 w-24 rounded-full bg-violet-200/70 blur-2xl sm:-right-6" />

            <div className="relative rounded-[28px] border border-white bg-white p-4 shadow-2xl shadow-violet-200/50 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Career overview
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your journey, organized
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <TrendingUp size={21} />
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-violet-100">
                      Your next move
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                      Start with your skills.
                    </h2>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-violet-100">
                      Create your profile and explore the possibilities ahead.
                    </p>
                  </div>
                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
                    <Sparkles size={24} />
                  </div>
                </div>

                <Link
                  to="/register"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
                >
                  Build your profile <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={19} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    Your profile
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Showcase your experience
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <BriefcaseBusiness size={19} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    Job discovery
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Find your next role
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex md:-left-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={23} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  One step at a time
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Build a stronger career profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
                Explore possibilities
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Find your direction.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Start exploring career areas that match your interests and
                professional ambitions.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 self-start text-sm font-bold text-violet-600 transition hover:text-violet-700 sm:self-auto"
            >
              Browse opportunities <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.name}
                  to={`/jobs?search=${encodeURIComponent(category.name)}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={22} />
                  </span>

                  <h3 className="mt-5 text-base font-bold text-slate-900">
                    {category.name}
                  </h3>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {category.count}
                    </span>
                    <ChevronRight
                      size={17}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
              More than job searching
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tools for your career journey.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              Bring your job search and career preparation together in one
              organized experience.
            </p>
          </div>

          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-6 text-lg font-extrabold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>

                  <Link
                    to="/register"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:gap-3"
                  >
                    Get started <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recruiter call to action */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-[#17152f] p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-violet-200">
              <Users size={15} /> For hiring teams
            </div>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find people who move your team forward.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Create a recruiter account to publish opportunities and manage
              your hiring workflow.
            </p>
          </div>

          <Link
            to="/register"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-6 py-4 text-sm font-bold text-violet-700 transition hover:bg-violet-50 lg:self-center"
          >
            Join as recruiter <ArrowDownRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <BriefcaseBusiness size={19} />
            </span>
            <span className="font-extrabold tracking-tight">
              Career<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <p className="text-sm text-slate-500">
            Helping people take the next step in their careers.
          </p>

          <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link to="/jobs" className="transition hover:text-violet-600">
              Jobs
            </Link>
            <Link to="/login" className="transition hover:text-violet-600">
              Sign in
            </Link>
            <Link to="/register" className="transition hover:text-violet-600">
              Join us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
