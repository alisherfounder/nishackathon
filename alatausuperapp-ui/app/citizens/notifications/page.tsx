"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface NotificationItem {
  id: string; type: string; title: string; body?: string;
  lat?: number; lon?: number; created_at?: string;
}

interface Report {
  id: string; title: string; description?: string;
  lat?: number; lon?: number; status: string; created_at?: string;
}

const ALERT_CFG: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  DANGER: { bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500",    label: "Danger"    },
  JAM:    { bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500",  label: "Traffic"   },
  POLL:   { bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   label: "Poll"      },
  ROAD:   { bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", label: "Road Work" },
  INFO:   { bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500",   label: "Info"      },
};

const REPORT_STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open:      { label: "Open",       bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  in_review: { label: "In Review",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  resolved:  { label: "Resolved",   bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  revoked:   { label: "Revoked",    bg: "bg-gray-50",   text: "text-gray-500",   dot: "bg-gray-400"   },
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CitizensMessagesPage() {
  const [tab, setTab] = useState<"alerts" | "reports">("alerts");

  // Alerts
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState("all");

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    fetch(`${API}/notifications`)
      .then((r) => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setAlertsLoading(false));
  }, []);

  function fetchReports() {
    setReportsLoading(true);
    fetch(`${API}/reports`)
      .then((r) => r.ok ? r.json() : [])
      .then(setReports)
      .catch(() => {})
      .finally(() => setReportsLoading(false));
  }

  useEffect(() => { fetchReports(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() || undefined }),
      });
      if (res.ok) {
        setForm({ title: "", description: "" });
        setShowForm(false);
        fetchReports();
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const alertTypes = ["all", ...Array.from(new Set(notifications.map((n) => n.type)))];
  const filteredAlerts = alertFilter === "all" ? notifications : notifications.filter((n) => n.type === alertFilter);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">Messages</h1>
        <p className="text-xs text-gray-400 mt-0.5">City alerts and your reports</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
        {([["alerts", "Alerts"], ["reports", "Reports"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
            {label}
            {key === "reports" && reports.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">{reports.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Alerts tab ── */}
      {tab === "alerts" && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {alertTypes.map((t) => (
              <button key={t} onClick={() => setAlertFilter(t)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${alertFilter === t ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {t === "all" ? "All" : (ALERT_CFG[t]?.label ?? t)}
              </button>
            ))}
          </div>

          {alertsLoading ? (
            <div className="flex items-center justify-center min-h-40"><p className="text-gray-400 text-sm">Loading alerts…</p></div>
          ) : filteredAlerts.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center shadow-sm">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-gray-500 text-sm font-medium">No alerts to show</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredAlerts.map((notif) => {
                const cfg = ALERT_CFG[notif.type] ?? ALERT_CFG.INFO;
                return (
                  <div key={notif.id} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cfg.label}</span>
                          <span className="text-xs text-gray-400 shrink-0">{timeAgo(notif.created_at)}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                        {notif.body && <p className="text-xs text-gray-500 mt-1">{notif.body}</p>}
                        {notif.lat != null && notif.lon != null && (
                          <p className="text-[10px] text-gray-400 font-mono mt-2">{notif.lat.toFixed(3)}, {notif.lon.toFixed(3)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Reports tab ── */}
      {tab === "reports" && (
        <>
          {/* Create report button / form */}
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="w-full mb-4 py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Report
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mb-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <p className="text-sm font-bold text-gray-900">New Report</p>
              <input
                required
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              />
              {submitError && (
                <p className="text-xs text-red-500 text-center -mt-1">Failed to submit. Please try again.</p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowForm(false); setForm({ title: "", description: "" }); setSubmitError(false); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          )}

          {reportsLoading ? (
            <div className="flex items-center justify-center min-h-40"><p className="text-gray-400 text-sm">Loading reports…</p></div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center shadow-sm">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-gray-500 text-sm font-medium">No reports yet</p>
              <p className="text-gray-400 text-xs mt-1">Tap "New Report" to submit an issue</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((r) => {
                const cfg = REPORT_STATUS_CFG[r.status] ?? REPORT_STATUS_CFG.open;
                return (
                  <div key={r.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</p>
                        {r.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>}
                        {r.lat != null && r.lon != null && (
                          <p className="text-[10px] text-gray-400 font-mono mt-1.5">📍 {r.lat.toFixed(4)}, {r.lon.toFixed(4)}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(r.created_at)}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
