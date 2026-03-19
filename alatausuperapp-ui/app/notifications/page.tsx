"use client";

import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ConfirmDialog";
import TrashIcon from "../components/TrashIcon";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  lat?: number;
  lon?: number;
  geometry?: string;
  created_at?: string;
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  DANGER: { color: "text-red-700",    bg: "bg-red-50 border-red-200",     icon: "⚠",  label: "DANGER" },
  JAM:    { color: "text-amber-700",  bg: "bg-amber-50 border-amber-200", icon: "●",  label: "TRAFFIC" },
  POLL:   { color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   icon: "✉",  label: "POLL" },
  ROAD:   { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: "🚧", label: "ROAD WORK" },
  INFO:   { color: "text-brand",      bg: "bg-brand-light/10 border-brand-light", icon: "ℹ", label: "INFO" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API}/notifications`);
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch {
      // API may be down
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function handleDelete(id: string, title: string, type: string) {
    const variant = type === "DANGER" ? "danger" : type === "JAM" ? "warning" : "default";
    const typeLabel =
      type === "DANGER" ? "Danger Alert"
      : type === "JAM" ? "Traffic Report"
      : type === "ROAD" ? "Road Work"
      : type === "INFO" ? "Notification"
      : "Notification";
    const confirmed = await confirm({
      title: `Delete ${typeLabel}`,
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: variant as "danger" | "warning" | "default",
    });
    if (!confirmed) return;
    await fetch(`${API}/notifications/${id}`, { method: "DELETE" });
    toast(`Notification deleted`, "success");
    fetchNotifications();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.INFO;
            // Parse road geometry for waypoint count
            let waypointCount = 0;
            if (notif.type === "ROAD" && notif.geometry) {
              try { waypointCount = (JSON.parse(notif.geometry) as unknown[]).length; } catch { /* ignore */ }
            }
            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-5 shadow-sm ${config.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-lg mt-0.5 select-none">{config.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                          {config.label}
                        </span>
                        {notif.lat != null && notif.lon != null && (
                          <span className="text-xs text-gray-400 font-mono">
                            {notif.lat.toFixed(3)}, {notif.lon.toFixed(3)}
                          </span>
                        )}
                        {notif.type === "ROAD" && waypointCount > 0 && (
                          <span className="text-xs text-orange-600 font-medium">
                            {waypointCount} waypoints
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      {notif.body && (
                        <p className="text-sm text-gray-500 mt-1">{notif.body}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {notif.created_at ? new Date(notif.created_at).toLocaleString() : ""}
                    </span>
                    <button
                      onClick={() => handleDelete(notif.id, notif.title, notif.type)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
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
