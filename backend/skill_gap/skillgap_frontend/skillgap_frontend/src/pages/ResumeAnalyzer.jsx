import { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import Loading from "../components/Loading";
import { apiFetch } from "../lib/api";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const missing = useMemo(() => result?.missing_skills || [], [result]);

  async function upload() {
    setErr("");
    if (!file) return setErr("Please choose a PDF resume.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const data = await apiFetch("/resume/upload", { method: "POST", body: fd, isForm: true });
      setResumeId(data.resume_id);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function match() {
    setErr("");
    if (!resumeId) return setErr("Upload resume first.");
    if (!jd.trim()) return setErr("Paste job description.");
    setLoading(true);
    try {
      const data = await apiFetch("/resume/match", { method: "POST", body: { resume_id: resumeId, job_description: jd } });
      setResult(data.match);
      setMatchId(data.match_id);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <TopBar title="Resume Analyzer" subtitle="Upload a resume PDF and paste a job description to get missing skills." />
      {err ? <div className="card p-4 border border-rose-200 bg-rose-50 text-rose-800 text-sm font-semibold">{err}</div> : null}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm font-extrabold">1) Upload resume (PDF)</div>
          <div className="mt-4 space-y-3">
            <input type="file" accept="application/pdf" className="input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="btn btn-primary" onClick={upload} disabled={loading}>Upload</button>
            {resumeId ? <div className="text-xs text-slate-600">resume_id: <span className="kbd">{resumeId}</span></div> : null}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-extrabold">2) Paste job description</div>
          <textarea className="input mt-3 min-h-[180px]" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste job description here..." />
          <div className="mt-3 flex items-center gap-2">
            <button className="btn btn-primary" onClick={match} disabled={loading}>Analyze match</button>
            {matchId ? <span className="badge">match_id: {matchId}</span> : null}
          </div>
        </div>
      </div>

      {loading ? <Loading label="Analyzing..." /> : null}

      {result ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-xs font-semibold text-slate-500">Match score</div>
            <div className="text-4xl font-extrabold mt-2">{result.match_score.toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-2">Semantic similarity: {result.semantic_similarity.toFixed(1)}%</div>
          </div>

          <div className="card p-4 lg:col-span-2">
            <div className="text-sm font-extrabold">Missing skills</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {missing.length ? missing.map((s) => <span key={s} className="badge">{s}</span>) : <span className="text-sm text-slate-600">No missing skills detected.</span>}
            </div>
          </div>

          <div className="card p-4 lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-extrabold">Resume skills</div>
                <div className="mt-2 flex flex-wrap gap-2">{(result.resume_skills || []).map((s) => <span key={s} className="badge">{s}</span>)}</div>
              </div>
              <div>
                <div className="text-sm font-extrabold">JD skills</div>
                <div className="mt-2 flex flex-wrap gap-2">{(result.jd_skills || []).map((s) => <span key={s} className="badge">{s}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
