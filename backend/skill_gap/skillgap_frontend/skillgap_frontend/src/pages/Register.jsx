import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setToken } from "../lib/storage";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", { method: "POST", body: { name, email, password } });
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
      <div className="text-2xl font-extrabold tracking-tight">Create account</div>
      <div className="text-sm text-slate-600 mt-1">Your progress and recommendations stay saved.</div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-600">Name</label>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aakash" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600">Email</label>
          <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600">Password</label>
          <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {err ? <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div> : null}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-600">
        Already have an account? <Link className="font-bold underline" to="/login">Login</Link>
      </div>
    </div>
  );
}
