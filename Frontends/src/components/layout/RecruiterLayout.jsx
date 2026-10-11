import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

const navItems = [
  { label: "Dashboard", path: "/recruiter/dashboard", icon: "⌂" },
  { label: "Post a Job", path: "/recruiter/create-job", icon: "+" },
  { label: "Manage Jobs", path: "/recruiter/my-jobs", icon: "▤" },
  { label: "Applications", path: "/recruiter/applications", icon: "♧" },
  { label: "Analytics", path: "/recruiter/analytics", icon: "▥" },
  { label: "Company Profile", path: "/recruiter/profile", icon: "◉" },
  { label: "Billing", path: "/recruiter/payment", icon: "₹" },
];

export default function RecruiterLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white">
            J
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">JobPilot</h1>
            <p className="text-xs text-slate-500">Recruiter Workspace</p>
          </div>
        </div>

        <div className="px-5 pt-7">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Recruitment
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`
                }
              >
                <span className="w-5 text-center text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-5">
          <div className="mb-4 rounded-2xl bg-indigo-50 p-4">
            <p className="text-sm font-bold text-indigo-900">
              Build your dream team
            </p>
            <p className="mt-1 text-xs leading-5 text-indigo-700">
              Publish jobs and manage applicants from one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-slate-200 px-3 py-2 text-lg lg:hidden"
            >
              ☰
            </button>
            <div>
              <p className="text-sm font-bold">Recruiter Workspace</p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Manage hiring in one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/recruiter/profile")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Company Account
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
