import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import Table from "../components/Table";
import Loading from "../components/Loading";
import { apiFetch } from "../lib/api";
import { Search } from "lucide-react";

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData(await apiFetch("/leaderboard")); }
      finally { setLoading(false); }
    })();
  }, []);

  const rows = useMemo(() => {
    const items = data?.leaderboard || [];
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((r) => (r.name || "").toLowerCase().includes(s));
  }, [data, q]);

  const columns = [
    { key: "rank", header: "Rank", className: "w-20" },
    { key: "name", header: "Student" },
    { key: "total_score", header: "Total", render: (r) => r.total_score?.toFixed(1), className: "w-24" },
    { key: "leetcode_score", header: "LeetCode", render: (r) => r.leetcode_score?.toFixed(1), className: "w-28" },
    { key: "github_score", header: "GitHub", render: (r) => r.github_score?.toFixed(1), className: "w-24" },
    { key: "cert_score", header: "Certs", render: (r) => r.cert_score?.toFixed(1), className: "w-24" },
    { key: "project_score", header: "Projects", render: (r) => r.project_score?.toFixed(1), className: "w-24" },
  ];

  return (
    <div className="space-y-6">
      <TopBar
        title="Leaderboard"
        subtitle={`Daily ranking (${data?.date || "today"})`}
        right={
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9 w-72" placeholder="Search student name..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        }
      />
      <div className="md:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search student name..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {loading ? <Loading label="Loading leaderboard..." /> : null}
      {!loading ? <Table columns={columns} rows={rows} rowKey={(r) => r.user_id} /> : null}
    </div>
  );
}
