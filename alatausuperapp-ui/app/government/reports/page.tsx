"use client";

import { useEffect, useState } from "react";
import { useToast } from "../../components/Toast";
import { useConfirm } from "../../components/ConfirmDialog";
import TrashIcon from "../../components/TrashIcon";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface Report {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lon?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open:      { label: "Open",       bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  in_review: { label: "In Review",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  resolved:  { label: "Resolved",   bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  revoked:   { label: "Revoked",    bg: "bg-gray-50",   text: "text-gray-500",   dot: "bg-gray-400"   },
};

const STATUS_ACTIONS = [
  { status: "in_review", label: "Mark as Reviewing",  style: "border-amber-200 text-amber-600 hover:bg-amber-50"    },
  { status: "resolved",  label: "Mark as Resolved",   style: "border-green-200 text-green-600 hover:bg-green-50"    },
  { status: "open",      label: "Reopen",             style: "border-blue-200 text-blue-600 hover:bg-blue-50"       },
];

export default function GovernmentReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function fetchReports() {
    try {
      const res = await fetch(`${API}/reports`);
      if (res.ok) setReports(await res.json());
    } catch { /* API down */ }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchReports(); }, []);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
        toast(`Status set to "${STATUS_CFG[status]?.label ?? status}"`, "success");
      }
    } catch { toast("Failed to update status", "error"); }
    finally { setUpdatingId(null); }
  }

  async function handleRevoke(id: string, title: string) {
    const confirmed = await confirm({
      title: "Revoke Report",
      message: `Permanently delete the report "${title}"? This cannot be undone.`,
      confirmLabel: "Revoke",
      variant: "danger",
    });
    if (!confirmed) return;
    await fetch(`${API}/reports/${id}`, { method: "DELETE" });
    toast("Report revoked", "success");
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus);

  const stats = [
    { label: "Total",     value: reports.length,                                         color: "text-gray-900"  },
    { label: "Open",      value: reports.filter((r) => r.status === "open").length,      color: "text-blue-600"  },
    { label: "In Review", value: reports.filter((r) => r.status === "in_review").length, color: "text-amber-600" },
    { label: "Resolved",  value: reports.filter((r) => r.status === "resolved").length,  color: "text-green-600" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading reports...</div></div>;
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Citizen Reports</h1>
        <p className="text-sm text-gray-400 mt-1">Issues submitted by citizens via the app</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No reports found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((report) => {
            const statusCfg = STATUS_CFG[report.status] ?? STATUS_CFG.open;
            const isUpdating = updatingId === report.id;

            return (
              <div key={report.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                        {report.lat != null && report.lon != null && (
                          <span className="text-xs text-gray-400 font-mono bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                            📍 {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{report.title}</p>
                      {report.description && <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>}
                      {report.created_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted {new Date(report.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>

                    {/* Revoke */}
                    <button onClick={() => handleRevoke(report.id, report.title)}
                      className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors shrink-0">
                      <TrashIcon /> Revoke
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium mr-1">Action:</span>
                    {STATUS_ACTIONS.map((action) => (
                      <button key={action.status}
                        disabled={report.status === action.status || isUpdating}
                        onClick={() => handleStatusChange(report.id, action.status)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all disabled:opacity-40 bg-white ${
                          report.status === action.status
                            ? action.style.replace("hover:", "") + " ring-1 ring-current/30"
                            : action.style
                        }`}>
                        {report.status === action.status ? `✓ ${action.label}` : action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
