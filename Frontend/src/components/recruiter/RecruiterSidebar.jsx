import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function RecruiterSidebar({ onLogout }) {
  const location = useLocation();

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: "▦",
      type: "normal",
    },
    {
  to: "/payment",
  label: "Payment",
  icon: "₹",
  type: "payment",
},
    {
      to: "/create-job",
      label: "Create Job",
      icon: "+",
      type: "create",
    },
    {
      to: "/my-jobs",
      label: "My Job Listings",
      icon: "▤",
      type: "normal",
    },
    {
      to: "/applications",
      label: "Applications",
      icon: "◉",
      type: "normal",
    },
    {
      to: "/profile",
      label: "Profile",
      icon: "◎",
      type: "normal",
    },
  ];

  return (
    <aside
      className="
        flex
        h-full
        w-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-800
        bg-[#0b0b0b]
        px-4
        py-6
        text-white
        shadow-2xl
      "
    >
      {/* ================= BRAND ================= */}
      <div className="mb-8 px-3">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Recruiter
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your hiring
        </p>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          /* ================= CREATE JOB ================= */
          if (item.type === "create") {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="
                
                group
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                text-gray-400 hover:bg-[#171717] hover:text-white
              "
              >
               <span
  className="
 
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  text-lg
                  font-semibold
                  transition-all
                  duration-200
                  bg-[#171717] text-gray-400 group-hover:bg-black group-hover:text-white
                
">
  +
</span>

                <span>{item.label}</span>
              </Link>
            );
          }

          /* ================= NORMAL NAV ITEM ================= */
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                group
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "text-gray-400 hover:bg-[#171717] hover:text-white"
                }
              `}
            >
              {/* ICON */}
              <span
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  text-lg
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-[#171717] text-gray-400 group-hover:bg-black group-hover:text-white"
                  }
                `}
              >
                {item.icon}
              </span>

              {/* LABEL */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ================= LOGOUT ================= */}
      <div className="mt-4 border-t border-gray-800 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-semibold
            text-gray-400
            transition-all
            duration-200
            hover:bg-red-950/60
            hover:text-red-400
          "
        >
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#171717]
              text-lg
              transition-all
              duration-200
              group-hover:bg-red-900/50
              group-hover:text-red-400
            "
          >
            ↪
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}