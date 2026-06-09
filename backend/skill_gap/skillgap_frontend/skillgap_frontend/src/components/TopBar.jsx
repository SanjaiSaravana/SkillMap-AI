import { LogOut } from "lucide-react";
import { clearToken } from "../lib/storage";

export default function TopBar({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-2xl font-extrabold tracking-tight">{title}</div>
        {subtitle ? <div className="text-sm text-slate-600 mt-1">{subtitle}</div> : null}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <button className="btn" onClick={() => { clearToken(); window.location.href = "/login"; }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
