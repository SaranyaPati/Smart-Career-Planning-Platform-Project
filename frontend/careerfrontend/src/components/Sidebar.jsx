import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/profile",   icon: "👤", label: "Profile"   },
  { to: "/resume",    icon: "📄", label: "Resume"    },
  { to: "/jobs",      icon: "💼", label: "Jobs"      },
  { to: "/careers",   icon: "🎯", label: "Careers"   },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen p-6 shrink-0 text-left">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">Menu</h4>
      <ul className="space-y-2">
        {links.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span>{icon}</span> {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;