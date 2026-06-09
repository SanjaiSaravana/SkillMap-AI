import { NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy, Layers, Briefcase, FileText, Sparkles, Route } from "lucide-react";
import { cn } from "../lib/utils";

const items = [
  { to: "/app/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/app/clusters", label: "Clusters", icon: Layers },
  { to: "/app/internships", label: "Internships", icon: Briefcase },
  { to: "/app/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/app/persona", label: "Future Persona", icon: Sparkles },
  { to: "/app/learning-map", label: "Learning Map", icon: Route },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64">
      <div className="card p-4 sticky top-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-tight">SkillGap</div>
          <span className="badge">v2</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Rank • Cluster • Recommend • Roadmap</div>
        <nav className="mt-4 flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                  )
                }
              >
                <Icon size={18} />
                {it.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-6 text-xs text-slate-500">
          Tip: Use <span className="kbd">Search</span> on pages to filter fast.
        </div>
      </div>
    </aside>
  );
}
