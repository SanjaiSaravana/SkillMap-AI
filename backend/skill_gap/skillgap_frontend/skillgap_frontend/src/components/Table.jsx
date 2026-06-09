import { cn } from "../lib/utils";
export default function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-100 bg-white shadow-soft">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-100">
            {columns.map((c) => (
              <th key={c.key} className={cn("text-left px-4 py-3 font-extrabold text-slate-700", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-slate-50 hover:bg-slate-50/50">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 text-slate-700 align-top", c.className)}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">No data</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
