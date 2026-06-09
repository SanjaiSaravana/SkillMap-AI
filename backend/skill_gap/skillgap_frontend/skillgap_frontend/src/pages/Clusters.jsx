import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import Loading from "../components/Loading";
import { apiFetch } from "../lib/api";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

export default function Clusters() {
  const [data, setData] = useState(null);
  const [mine, setMine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, m] = await Promise.all([apiFetch("/clusters"), apiFetch("/clusters/me")]);
        setData(c); setMine(m);
      } finally { setLoading(false); }
    })();
  }, []);

  const summary = useMemo(() => {
    const clusters = data?.clusters || [];
    const map = new Map();
    for (const run of clusters) {
      for (const mem of run.members || []) {
        const key = `${run.domain} • ${mem.cluster_name}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,8);
  }, [data]);

  return (
    <div className="space-y-6">
      <TopBar title="Clusters" subtitle="Domain-wise clustering of certifications and project signals." />
      {loading ? <Loading label="Loading clusters..." /> : null}

      {!loading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-4 lg:col-span-2">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-extrabold">Cluster distribution</div>
                <div className="text-xs text-slate-500 mt-1">Top 8 domain-cluster buckets by member count.</div>
              </div>
              <span className="badge">{data?.date || "today"}</span>
            </div>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary} dataKey="value" nameKey="name" outerRadius={110} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-extrabold">Your memberships</div>
            <div className="text-xs text-slate-500 mt-1">Where you currently belong per domain.</div>
            <div className="mt-4 space-y-2">
              {(mine?.memberships || []).length ? (
                mine.memberships.map((m) => (
                  <div key={m.domain} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-sm font-bold">{m.domain}</div>
                    <div className="text-xs text-slate-600 mt-1">{m.cluster_name}</div>
                    <div className="text-xs text-slate-500 mt-1">Confidence: {(m.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600">No cluster memberships yet.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-4">
          {(data?.clusters || []).map((run) => (
            <div key={run.domain} className="card p-4">
              <div className="text-sm font-extrabold">{run.domain}</div>
              <div className="text-xs text-slate-500 mt-1">k={run.k}</div>
              <div className="mt-3 grid md:grid-cols-3 gap-3">
                {Object.entries(run.label_names || {}).map(([lbl, name]) => (
                  <div key={lbl} className="rounded-xl border border-slate-100 p-3 bg-white">
                    <div className="text-xs text-slate-500">Cluster {lbl}</div>
                    <div className="text-sm font-bold mt-1">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
