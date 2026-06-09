import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import { apiFetch } from "../lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Overview() {
  const [lb, setLb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLb(await apiFetch("/leaderboard")); }
      finally { setLoading(false); }
    })();
  }, []);

  const stats = useMemo(() => {
    if (!lb?.leaderboard?.length) return null;
    const top = lb.leaderboard[0];
    const count = lb.leaderboard.length;
    const avg = lb.leaderboard.reduce((a, r) => a + (r.total_score || 0), 0) / count;
    return { top, count, avg };
  }, [lb]);

  const chartData = useMemo(() => {
    if (!lb?.leaderboard?.length) return [];
    return lb.leaderboard.slice(0, 12).map((r) => ({
      name: r.name?.split(" ")[0] || `#${r.rank}`,
      score: Math.round(r.total_score || 0),
    })).reverse();
  }, [lb]);

  return (
    <div className="space-y-6">
      <TopBar title="Overview" subtitle="Snapshot of daily rankings and score curve." />
      {loading ? <Loading label="Loading overview..." /> : null}

      {!loading && stats ? (
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard label="Students ranked (today)" value={stats.count} />
          <StatCard label="Average total score" value={stats.avg.toFixed(1)} hint="Normalized 0–100 across signals" />
          <StatCard label="Top performer" value={`${stats.top.name} (#${stats.top.rank})`} hint={`Score ${stats.top.total_score.toFixed(1)}`} />
        </div>
      ) : null}

      <div className="card p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold">Top scores</div>
            <div className="text-xs text-slate-500 mt-1">Score curve for top 12 students today.</div>
          </div>
          <span className="badge">Leaderboard</span>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 4, right: 10, top: 10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm font-extrabold">What you should do</div>
          <ol className="mt-3 text-sm text-slate-700 space-y-2 list-decimal pl-5">
            <li>Check your Leaderboard rank.</li>
            <li>Update certifications/projects and review Clusters.</li>
            <li>Upload resume + paste JD to get missing skills.</li>
            <li>Enter skill ratings in Future Persona.</li>
            <li>Generate Learning Map with your match_id.</li>
          </ol>
        </div>
        <div className="card p-4">
          <div className="text-sm font-extrabold">Scoring signals</div>
          <ul className="mt-3 text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>LeetCode problems solved</li>
            <li>GitHub activity proxy (projects submitted + days worked)</li>
            <li>Certifications count</li>
            <li>Projects count</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
