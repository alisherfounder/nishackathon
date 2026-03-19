"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000";

interface Project {
  id: string;
  title: string;
  description?: string;
  institution: string;
  status: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
}

interface Sensor {
  id: string;
  aqi: number;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  is_active: boolean;
  options: PollOption[];
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  planned: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

const TYPE_COLORS: Record<string, string> = {
  DANGER: "bg-red-50 text-red-700 border-red-200",
  JAM: "bg-amber-50 text-amber-700 border-amber-200",
  POLL: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, notifRes, sensorRes, pollsRes] = await Promise.allSettled([
          fetch(`${API}/projects`),
          fetch(`${API}/notifications`),
          fetch(`${API}/sensors`),
          fetch(`${API}/polls`),
        ]);
        if (projRes.status === "fulfilled" && projRes.value.ok)
          setProjects(await projRes.value.json());
        if (notifRes.status === "fulfilled" && notifRes.value.ok)
          setNotifications(await notifRes.value.json());
        if (sensorRes.status === "fulfilled" && sensorRes.value.ok)
          setSensors(await sensorRes.value.json());
        if (pollsRes.status === "fulfilled" && pollsRes.value.ok)
          setPolls(await pollsRes.value.json());
      } catch {
        // API may be down
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const alertCount = notifications.filter(
    (n) => n.type === "DANGER" || n.type === "JAM"
  ).length;
  const avgAqi =
    sensors.length > 0
      ? Math.round(sensors.reduce((sum, s) => sum + s.aqi, 0) / sensors.length)
      : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const activePolls = polls.filter((p) => p.is_active).length;
  const totalPollVotes = polls.reduce(
    (sum, p) => sum + p.options.reduce((s, o) => s + o.votes, 0),
    0
  );

  const stats = [
    { label: "Total Projects", value: projects.length, color: "text-gray-900" },
    { label: "Active Projects", value: activeProjects, color: "text-brand-mid" },
    { label: "Active Alerts", value: alertCount, color: "text-amber-600" },
    { label: "Active Polls", value: activePolls, color: "text-violet-600" },
    { label: "Avg AQI", value: avgAqi || "\u2014", color: "text-blue-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm"
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-400 text-sm">No projects yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {project.institution}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-3 text-xs px-2.5 py-0.5 rounded-full border ${
                      STATUS_COLORS[project.status] ?? STATUS_COLORS.completed
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Recent Alerts
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No alerts yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {notif.body}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-3 text-xs px-2.5 py-0.5 rounded-full border ${
                      TYPE_COLORS[notif.type] ?? TYPE_COLORS.POLL
                    }`}
                  >
                    {notif.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Polls Overview */}
      {polls.length > 0 && (
        <div className="mt-6 rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Poll Results
            </h2>
            <span className="text-xs text-gray-400">
              {totalPollVotes.toLocaleString()} total votes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {polls.slice(0, 3).map((poll) => {
              const total = poll.options.reduce((s, o) => s + o.votes, 0);
              const leader = poll.options.reduce((a, b) =>
                b.votes > a.votes ? b : a
              );
              const leaderPct =
                total > 0 ? Math.round((leader.votes / total) * 100) : 0;

              return (
                <div
                  key={poll.id}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {poll.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-mid rounded-full"
                        style={{ width: `${leaderPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-brand tabular-nums">
                      {leaderPct}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Leading: {leader.text} &middot;{" "}
                    {total.toLocaleString()} votes
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
