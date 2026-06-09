import { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import Loading from "../components/Loading";
import { apiFetch } from "../lib/api";

export default function LearningMap() {
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [resumeMatchId, setResumeMatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [markdown, setMarkdown] = useState("");
  const [err, setErr] = useState("");

  const plan = useMemo(() => roadmap?.plan || [], [roadmap]);

  async function generate() {
    setErr(""); setLoading(true);
    try {
      const data = await apiFetch("/learning-map/generate", {
        method: "POST",
        body: { target_role: targetRole, resume_match_id: resumeMatchId ? Number(resumeMatchId) : 0 },
      });
      setRoadmap(data.roadmap);
      setMarkdown(data.markdown || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <TopBar title="Learning Map" subtitle="Generate a personalized roadmap from skills + resume gaps." />
      {err ? <div className="card p-4 border border-rose-200 bg-rose-50 text-rose-800 text-sm font-semibold">{err}</div> : null}

      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600">Target role</label>
            <input className="input mt-1" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Resume match id (optional)</label>
            <input className="input mt-1" value={resumeMatchId} onChange={(e) => setResumeMatchId(e.target.value)} placeholder="e.g. 12" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="btn btn-primary" onClick={generate} disabled={loading}>Generate roadmap</button>
          <span className="text-xs text-slate-500">Use match_id from Resume Analyzer for best gaps.</span>
        </div>
      </div>

      {loading ? <Loading label="Generating roadmap..." /> : null}

      {plan.length ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-4 lg:col-span-2">
            <div className="text-sm font-extrabold">Roadmap</div>
            <div className="mt-4 space-y-3">
              {plan.map((w) => (
                <div key={w.week} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold">Week {w.week}</div>
                    <span className="badge">{(w.focus || []).length} focus</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">{(w.focus || []).map((s) => <span key={s} className="badge">{s}</span>)}</div>
                  <div className="mt-3 text-sm text-slate-700"><span className="font-bold">Deliverable:</span> {w.deliverable}</div>
                  <div className="mt-1 text-sm text-slate-700"><span className="font-bold">Checkpoint:</span> {w.checkpoint}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-extrabold">Markdown</div>
            <textarea className="input mt-3 min-h-[520px] font-mono text-xs" value={markdown} readOnly />
          </div>
        </div>
      ) : null}
    </div>
  );
}
