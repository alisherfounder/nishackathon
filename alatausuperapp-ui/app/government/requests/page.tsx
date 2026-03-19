"use client";

import { useEffect, useState } from "react";
import { useToast } from "../../components/Toast";
import { useConfirm } from "../../components/ConfirmDialog";
import TrashIcon from "../../components/TrashIcon";

const API = "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Request {
  id: string;
  requester_type: "individual" | "business";
  identifier: string;
  request_type: string;
  description?: string;
  address: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const TYPE_LABELS: Record<string, string> = {
  document_retrieval:       "Document Retrieval",
  non_commercial_building:  "Non-Commercial Building Permit",
  land_use_permit:          "Land Use Permit",
  property_registration:    "Property Registration",
  construction_permit:      "Construction Permit",
  utility_connection:       "Utility Connection",
  fence_garage_permit:      "Fence / Garage Permit",
  apartment_building:       "New Apartment Building",
  shopping_center:          "New Shopping Center",
  office_building:          "New Office Building",
  hotel:                    "New Hotel",
  industrial_facility:      "Industrial Facility",
  parking_lot:              "Parking Lot",
  restaurant_cafe:          "Restaurant / Café",
  mixed_use_development:    "Mixed-Use Development",
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:           { label: "Pending",           bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  under_review:      { label: "Under Review",      bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"  },
  approved:          { label: "Approved",           bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  rejected:          { label: "Denied",             bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"   },
  changes_requested: { label: "Changes Requested",  bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400"},
};

const REQUESTER_CFG = {
  individual: { label: "Individual", tag: "ИИН", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  business:   { label: "Business",   tag: "БИН", bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200"   },
};

// Status action buttons shown to government staff
const STATUS_ACTIONS = [
  { status: "under_review",      label: "Mark as Reviewing", style: "border-blue-200 text-blue-600 hover:bg-blue-50"   },
  { status: "approved",          label: "Approve",           style: "border-green-200 text-green-600 hover:bg-green-50" },
  { status: "rejected",          label: "Deny",              style: "border-red-200 text-red-600 hover:bg-red-50"       },
  { status: "changes_requested", label: "Suggest Changes",   style: "border-orange-200 text-orange-600 hover:bg-orange-50" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GovernmentRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function fetchRequests() {
    try {
      const res = await fetch(`${API}/requests`);
      if (res.ok) setRequests(await res.json());
    } catch { /* API down */ }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchRequests(); }, []);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
        toast(`Status set to "${STATUS_CFG[status]?.label ?? status}"`, "success");
      }
    } catch { toast("Failed to update status", "error"); }
    finally { setUpdatingId(null); }
  }

  async function handleRevoke(id: string, identifier: string) {
    const confirmed = await confirm({
      title: "Revoke Request",
      message: `Permanently delete the request from ${identifier}? This cannot be undone.`,
      confirmLabel: "Revoke",
      variant: "danger",
    });
    if (!confirmed) return;
    await fetch(`${API}/requests/${id}`, { method: "DELETE" });
    toast("Request revoked", "success");
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = requests.filter((r) => {
    if (filterType !== "all" && r.requester_type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const stats = [
    { label: "Total",          value: requests.length,                                          color: "text-gray-900" },
    { label: "Pending",        value: requests.filter((r) => r.status === "pending").length,           color: "text-amber-600" },
    { label: "Under Review",   value: requests.filter((r) => r.status === "under_review").length,      color: "text-blue-600"  },
    { label: "Approved",       value: requests.filter((r) => r.status === "approved").length,          color: "text-green-600" },
    { label: "Denied",         value: requests.filter((r) => r.status === "rejected").length,          color: "text-red-500"   },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading requests...</div></div>;
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-7">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
          {[["all", "All"], ["individual", "Individual"], ["business", "Business"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${filterType === v ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-700"}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-sm text-gray-400 ml-1">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No requests found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => {
            const statusCfg = STATUS_CFG[req.status] ?? STATUS_CFG.pending;
            const reqCfg = REQUESTER_CFG[req.requester_type];
            const typeLabel = TYPE_LABELS[req.request_type] ?? req.request_type;
            const isUpdating = updatingId === req.id;

            return (
              <div key={req.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${reqCfg.bg} ${reqCfg.text} ${reqCfg.border}`}>
                          <span className="font-bold">{reqCfg.tag}</span> {reqCfg.label}
                        </span>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">{typeLabel}</span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-400 mb-1 tracking-wider">{req.identifier}</p>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{req.address}</p>
                      {req.description && <p className="text-sm text-gray-500 line-clamp-2">{req.description}</p>}
                      {req.created_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>

                    {/* Revoke */}
                    <button onClick={() => handleRevoke(req.id, req.identifier)}
                      className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors shrink-0">
                      <TrashIcon /> Revoke
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium mr-1">Action:</span>
                    {STATUS_ACTIONS.map((action) => (
                      <button key={action.status}
                        disabled={req.status === action.status || isUpdating}
                        onClick={() => handleStatusChange(req.id, action.status)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all disabled:opacity-40 bg-white ${
                          req.status === action.status
                            ? action.style.replace("hover:", "") + " ring-1 ring-current/30"
                            : action.style
                        }`}>
                        {req.status === action.status ? `✓ ${action.label}` : action.label}
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
