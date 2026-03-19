"use client";

import { useEffect, useState } from "react";

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
}

const INDIVIDUAL_TYPES: Record<string, string> = {
  document_retrieval:      "Document Retrieval",
  non_commercial_building: "Non-Commercial Building Permit",
  land_use_permit:         "Land Use Permit",
  property_registration:   "Property Registration",
  construction_permit:     "Construction Permit",
  utility_connection:      "Utility Connection",
  fence_garage_permit:     "Fence / Garage Permit",
};

const BUSINESS_TYPES: Record<string, string> = {
  apartment_building:    "New Apartment Building",
  shopping_center:       "New Shopping Center",
  office_building:       "New Office Building",
  hotel:                 "New Hotel",
  industrial_facility:   "Industrial Facility",
  parking_lot:           "Parking Lot",
  restaurant_cafe:       "Restaurant / Café",
  mixed_use_development: "Mixed-Use Development",
};

const TYPE_LABELS: Record<string, string> = { ...INDIVIDUAL_TYPES, ...BUSINESS_TYPES };

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:           { label: "Pending",          bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  under_review:      { label: "Under Review",     bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  approved:          { label: "Approved",          bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  rejected:          { label: "Denied",            bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
  changes_requested: { label: "Changes Requested", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

const INPUT = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CitizensRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"my" | "new">("my");
  const [searchId, setSearchId] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Form state
  const [form, setForm] = useState({
    requester_type: "individual" as "individual" | "business",
    identifier: "",
    request_type: "document_retrieval",
    description: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchRequests() {
    try {
      const res = await fetch(`${API}/requests`);
      if (res.ok) setRequests(await res.json());
    } catch { /* API down */ }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchRequests(); }, []);

  function handleRequesterTypeChange(type: "individual" | "business") {
    const first = type === "individual" ? Object.keys(INDIVIDUAL_TYPES)[0] : Object.keys(BUSINESS_TYPES)[0];
    setForm((f) => ({ ...f, requester_type: type, request_type: first }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = form.identifier.replace(/\D/g, "");
    if (digits.length !== 12) {
      showToast(`${form.requester_type === "individual" ? "ИИН" : "БИН"} must be exactly 12 digits`, false);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, identifier: digits, description: form.description || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Failed");
      }
      showToast("Request submitted successfully!");
      setForm({ requester_type: "individual", identifier: "", request_type: "document_retrieval", description: "", address: "" });
      fetchRequests();
      setTab("my");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Submission failed", false);
    } finally {
      setSubmitting(false);
    }
  }

  const typeOptions = form.requester_type === "individual" ? INDIVIDUAL_TYPES : BUSINESS_TYPES;

  // Filter "my" requests by identifier search
  const displayed = searchId.trim().length >= 4
    ? requests.filter((r) => r.identifier.includes(searchId.replace(/\D/g, "")))
    : requests;

  return (
    <div className="max-w-lg mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-lg transition-all ${toast.ok ? "bg-teal-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Tab bar */}
      <div className="sticky top-[57px] z-20 bg-gray-50 border-b border-gray-100 flex">
        <button onClick={() => setTab("my")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === "my" ? "border-teal-500 text-teal-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          My Requests
        </button>
        <button onClick={() => setTab("new")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === "new" ? "border-teal-500 text-teal-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          + New Request
        </button>
      </div>

      {/* ── MY REQUESTS ── */}
      {tab === "my" && (
        <div className="p-4">
          {/* Search by ИИН/БИН */}
          <div className="mb-4">
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="Search by ИИН / БИН (min 4 digits)"
              className={INPUT}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-gray-400 text-sm">Loading...</p></div>
          ) : displayed.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center shadow-sm">
              <p className="text-gray-400 text-sm">{searchId.length >= 4 ? "No requests found for this identifier." : "No requests yet."}</p>
              <button onClick={() => setTab("new")} className="mt-3 text-sm font-medium text-teal-500 hover:text-teal-600">Submit a request →</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayed.map((req) => {
                const statusCfg = STATUS_CFG[req.status] ?? STATUS_CFG.pending;
                const typeLabel = TYPE_LABELS[req.request_type] ?? req.request_type;
                const isIndividual = req.requester_type === "individual";

                return (
                  <div key={req.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isIndividual ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                          {isIndividual ? "ИИН" : "БИН"}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{req.identifier}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Type */}
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{typeLabel}</span>

                    {/* Address */}
                    <p className="text-sm font-semibold text-gray-900 mt-2">{req.address}</p>

                    {/* Description */}
                    {req.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>}

                    {/* Date */}
                    {req.created_at && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── NEW REQUEST ── */}
      {tab === "new" && (
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">

          {/* Requester type */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">I am a...</p>
            <div className="flex gap-3">
              {(["individual", "business"] as const).map((t) => {
                const tag = t === "individual" ? "ИИН" : "БИН";
                const label = t === "individual" ? "Individual" : "Business";
                const active = form.requester_type === t;
                return (
                  <button key={t} type="button" onClick={() => handleRequesterTypeChange(t)}
                    className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-sm font-semibold transition-all ${active ? "bg-teal-50 border-teal-400 text-teal-700 ring-2 ring-teal-500/20" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>{tag}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identifier */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">
              {form.requester_type === "individual" ? "ИИН" : "БИН"} <span className="text-gray-400 font-normal">(12 digits)</span>
            </label>
            <input required value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value.replace(/\D/g, "").slice(0, 12) })}
              placeholder={form.requester_type === "individual" ? "920814350178" : "180340021791"}
              className={INPUT} maxLength={12} />
            <p className="text-[10px] text-gray-400 mt-1 ml-1">{form.identifier.length}/12 digits</p>
          </div>

          {/* Request type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Request Type</label>
            <select required value={form.request_type}
              onChange={(e) => setForm({ ...form, request_type: e.target.value })}
              className={INPUT}>
              {Object.entries(typeOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Address</label>
            <input required value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="ul. Alatau 12, Gate District"
              className={INPUT} />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={form.description} rows={3}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your request in detail..."
              className={INPUT + " resize-none"} />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}
    </div>
  );
}
