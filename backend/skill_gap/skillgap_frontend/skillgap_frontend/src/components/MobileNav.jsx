import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, LayoutDashboard, Trophy, Layers, Briefcase, FileText, Sparkles, Route } from "lucide-react";
import { cn } from "../lib/utils";

const items = [
  { to: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/app/clusters", label: "Clusters", icon: Layers },
  { to: "/app/internships", label: "Internships", icon: Briefcase },
  { to: "/app/resume", label: "Resume", icon: FileText },
  { to: "/app/persona", label: "Persona", icon: Sparkles },
  { to: "/app/learning-map", label: "Learning Map", icon: Route },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button className="btn" onClick={() => setOpen(true)}>
        <Menu size={16} /> Menu
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
          <div className="absolute left-3 right-3 top-3 card p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold">SkillGap</div>
              <button className="btn" onClick={() => setOpen(false)}><X size={16} /> Close</button>
            </div>
            <nav className="mt-3 grid grid-cols-2 gap-2">
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border",
                        isActive ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"
                      )
                    }
                  >
                    <Icon size={16} /> {it.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
