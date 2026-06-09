import { Outlet, Link } from "react-router-dom";
export default function AuthLayout() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-extrabold tracking-tight">SkillGap</Link>
          <span className="badge">Hackathon-ready</span>
        </div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block">
            <div className="text-4xl font-extrabold tracking-tight leading-tight">Rank. Cluster. Recommend. Build a roadmap.</div>
            <div className="mt-4 text-slate-600 max-w-md">
              Dashboard for daily ranking, portfolio clustering, internship matches, resume analysis, and personalized learning maps.
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="badge">JWT</span><span className="badge">KMeans</span><span className="badge">TF-IDF</span><span className="badge">Roadmap</span>
            </div>
          </div>
          <div className="card p-6 md:p-8"><Outlet /></div>
        </div>
        <div className="mt-8 text-xs text-slate-500">Backend base URL: <span className="kbd">VITE_API_BASE</span> in <span className="kbd">.env</span></div>
      </div>
    </div>
  );
}
