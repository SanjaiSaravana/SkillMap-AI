export default function Loading({ label = "Loading..." }) {
  return (
    <div className="card p-6 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
        <div className="text-sm font-semibold text-slate-700">{label}</div>
      </div>
    </div>
  );
}
