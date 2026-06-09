import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setToken } from "../lib/storage";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: { email, password } });
      setToken(data.access_token);
      nav("/app/overview");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-2xl font-extrabold tracking-tight">Login</div>
      <div className="text-sm text-slate-600 mt-1">Use demo credentials or your registered account.</div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-600">Email</label>
          <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600">Password</label>
          <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {err ? <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div> : null}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-600">
        New user? <Link className="font-bold underline" to="/register">Create account</Link>
      </div>
    </div>
  );
}
