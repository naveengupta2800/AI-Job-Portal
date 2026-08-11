import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Bookmark,
  User,
  BriefcaseBusiness,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function Navbar({ onLogout, savedCount = 0 }) {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  const location = useLocation();

  /* ================= THEME ================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  /* ================= NAVIGATION ================= */

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: Bookmark,
      count: savedCount,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
    {
      name: "Applied",
      path: "/applied",
      icon: BriefcaseBusiness,
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
  <header className="sticky top-[9px] z-50 mx-[8px] flex justify-center">
   <div
  className="
    mx-auto
    w-full
    max-w-[1100px]
    overflow-hidden
    rounded-2xl
    border
    border-white/[0.09]
    bg-[#0d111b]/95
    shadow-[0_12px_45px_rgba(0,0,0,0.40)]
    backdrop-blur-2xl
    transition-all
    duration-300
    hover:border-indigo-500/25
    hover:shadow-[0_16px_55px_rgba(0,0,0,0.48)]
  "
>
        {/* ================= NAVBAR MAIN ================= */}

        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ================= LOGO ================= */}

          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
          >
            <div
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-indigo-500
                via-indigo-600
                to-blue-600
                shadow-lg
                shadow-indigo-500/20
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:shadow-indigo-500/40
              "
            >
              <BriefcaseBusiness
                size={21}
                strokeWidth={2.5}
                className="text-white"
              />

              <span
                className="
                  absolute
                  inset-0
                  -z-10
                  rounded-xl
                  bg-indigo-500
                  opacity-20
                  blur-lg
                "
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-[17px] font-bold tracking-tight text-white">
                Job<span className="text-indigo-400">Matchers</span>
              </h1>

              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Find your opportunity
              </p>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}

          <nav className="hidden items-center rounded-xl border border-white/[0.05] bg-white/[0.025] p-1 md:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-indigo-500/15 text-indigo-300 shadow-sm"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.4 : 2}
                    className={`
                      transition-all
                      duration-200
                      group-hover:scale-110
                      ${
                        active
                          ? "text-indigo-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    `}
                  />

                  <span>{item.name}</span>

                  {item.count > 0 && (
                    <span
                      className="
                        flex
                        h-5
                        min-w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-500
                        px-1.5
                        text-[10px]
                        font-bold
                        text-white
                        shadow-lg
                        shadow-indigo-500/20
                      "
                    >
                      {item.count}
                    </span>
                  )}

                  {active && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-1/2
                        h-[2px]
                        w-6
                        -translate-x-1/2
                        rounded-full
                        bg-indigo-400
                      "
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ================= RIGHT ACTIONS ================= */}

          <div className="hidden items-center gap-2 md:flex">

            {/* Theme */}

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="
                group
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.03]
                text-slate-400
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-indigo-500/30
                hover:bg-indigo-500/10
                hover:text-indigo-300
              "
            >
              {darkMode ? (
                <Sun
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-45"
                />
              ) : (
                <Moon
                  size={18}
                  className="transition-transform duration-300 group-hover:-rotate-12"
                />
              )}
            </button>

            {/* Divider */}

            <div className="mx-1 h-7 w-px bg-white/[0.08]" />

            {/* Logout */}

            <button
              type="button"
              onClick={onLogout}
              className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.03]
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-400
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-red-500/25
                hover:bg-red-500/10
                hover:text-red-300
              "
            >
              <LogOut
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />

              <span>Logout</span>
            </button>
          </div>

          {/* ================= MOBILE BUTTON ================= */}

          <button
            type="button"
            onClick={() => setMobileMenu((prev) => !prev)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.03]
              text-slate-300
              transition-all
              duration-200
              hover:border-indigo-500/30
              hover:bg-indigo-500/10
              hover:text-indigo-300
              md:hidden
            "
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}

        {mobileMenu && (
          <div className="border-t border-white/[0.07] bg-[#0a0e17] px-4 py-4 md:hidden">

            <div className="space-y-1">

              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenu(false)}
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      ${
                        active
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={
                          active
                            ? "text-indigo-400"
                            : "text-slate-500"
                        }
                      />

                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.count > 0 && (
                        <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.count}
                        </span>
                      )}

                      <ChevronRight
                        size={15}
                        className="text-slate-600"
                      />
                    </div>
                  </Link>
                );
              })}

              <div className="my-3 h-px bg-white/[0.07]" />

              {/* Mobile Theme */}

              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-slate-400
                  transition-all
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                {darkMode ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}

                <span>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              {/* Mobile Logout */}

              <button
                type="button"
                onClick={onLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-medium
                  text-red-400
                  transition-all
                  hover:bg-red-500/10
                  hover:text-red-300
                "
              >
                <LogOut size={18} />

                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

