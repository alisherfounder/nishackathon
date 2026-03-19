"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000";

interface NotificationItem {
  id: string; type: string; title: string; body?: string;
  lat?: number; lon?: number; created_at?: string;
}

const TYPE_CONFIG: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  DANGER: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", label: "Danger" },
  JAM:    { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", label: "Traffic" },
  POLL:   { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", label: "Poll" },
  ROAD:   { bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", label: "Road Work" },
  INFO:   { bg: "bg-teal-50", border: "border-teal-200", dot: "bg-teal-500", label: "Info" },
};

export default function CitizensNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`${API}/notifications`)
      .then((r) => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = ["all", ...Array.from(new Set(notifications.map((n) => n.type)))];
  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  if (loading) {
    return <div className="flex items-center justify-center min-h-64"><div className="text-gray-400 text-sm">Loading alerts...</div></div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">City Alerts</h1>
        <p className="text-xs text-gray-400 mt-0.5">{notifications.length} notifications</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === t ? "bg-teal-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {t === "all" ? "All" : (TYPE_CONFIG[t]?.label ?? t)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No alerts to show.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.INFO;
            return (
              <div key={notif.id} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cfg.label}</span>
                      {notif.created_at && <span className="text-xs text-gray-400 shrink-0">{new Date(notif.created_at).toLocaleDateString()}</span>}
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
    </div>
  );
}
