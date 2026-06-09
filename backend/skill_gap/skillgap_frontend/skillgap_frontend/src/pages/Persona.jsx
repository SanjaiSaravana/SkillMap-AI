import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import Loading from "../components/Loading";
import { apiFetch } from "../lib/api";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const defaults = ["python","sql","react","javascript","machine learning","nlp","docker","kubernetes","aws"];

export default function Persona() {
  const [skills, setSkills] = useState({});
  const [aspiringRole, setAspiringRole] = useState("Data Scientist");
  const [projectsSummary, setProjectsSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch("/persona/skills/me");
        setSkills(me.skills || {});
        setAspiringRole(me.aspiring_role || "Data Scientist");
        setProjectsSummary(me.projects_summary || "");
      } finally { setLoading(false); }
    })();
  }, []);

  const chartData = useMemo(() => {
    const keys = Array.from(new Set([...defaults, ...Object.keys(skills || {})])).slice(0, 12);
    return keys.map((k) => ({ skill: k, level: Number(skills?.[k] || 0) }));
  }, [skills]);

  const updateSkill = (k, v) => setSkills((p) => ({ ...(p || {}), [k]: Number(v) }));

  async function save() {
    setErr(""); setSaving(true);
    try { await apiFetch("/persona/skills", { method: "POST", body: { skills, aspiring_role: aspiringRole, projects_summary: projectsSummary } }); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <TopBar title="Future Persona" subtitle="Enter skill ratings and target role." />
      {loading ? <Loading label="Loading profile..." /> : null}
      {err ? <div className="card p-4 border border-rose-200 bg-rose-50 text-rose-800 text-sm font-semibold">{err}</div> : null}

      {!loading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-4 lg:col-span-1">
            <div className="text-sm font-extrabold">Target role</div>
            <input className="input mt-2" value={aspiringRole} onChange={(e) => setAspiringRole(e.target.value)} />
            <div className="text-sm font-extrabold mt-4">Projects summary</div>
            <textarea className="input mt-2 min-h-[120px]" value={projectsSummary} onChange={(e) => setProjectsSummary(e.target.value)} />
            <button className="btn btn-primary mt-4 w-full" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
            <div className="text-xs text-slate-500 mt-3">Scale: 0–5 (0 = none, 5 = strong).</div>
          </div>

          <div className="card p-4 lg:col-span-2">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-extrabold">Skill radar</div>
                <div className="text-xs text-slate-500 mt-1">Update values below.</div>
              </div>
              <span className="badge">{aspiringRole || "Role"}</span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Radar dataKey="level" strokeWidth={2} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {chartData.map((d) => (
                <div key={d.skill} className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold">{d.skill}</div>
                    <div className="text-xs text-slate-500">0–5</div>
                  </div>
                  <input type="range" min="0" max="5" step="1" value={d.level} onChange={(e) => updateSkill(d.skill, e.target.value)} className="w-full mt-2" />
                  <div className="text-xs text-slate-600 mt-1">Level: {d.level}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
