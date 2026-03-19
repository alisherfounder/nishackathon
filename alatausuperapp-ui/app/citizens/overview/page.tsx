"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface Notification {
  id: string;
  title: string;
  message?: string;
  type?: string;
  created_at?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  project_type?: string;
  image_url?: string;
  completion_pct?: number;
  status?: string;
}

const TYPE_GRADIENT: Record<string, string> = {
  road:           "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
  park:           "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
  building:       "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
  utility:        "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
  infrastructure: "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
  residential:    "linear-gradient(135deg, #4a1942 0%, #9333ea 100%)",
  commercial:     "linear-gradient(135deg, #1c3240 0%, #0ea5e9 100%)",
  education:      "linear-gradient(135deg, #3b1f00 0%, #f59e0b 100%)",
  default:        "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
};

const NOTIF_CFG: Record<string, { icon: string; accent: string; badge: string }> = {
  road_closure: { icon: "🚧", accent: "bg-orange-500", badge: "bg-orange-50 text-orange-600" },
  construction: { icon: "🏗️", accent: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-600" },
  emergency:    { icon: "🚨", accent: "bg-red-500",    badge: "bg-red-50 text-red-600"       },
  maintenance:  { icon: "🔧", accent: "bg-blue-500",   badge: "bg-blue-50 text-blue-600"     },
  event:        { icon: "📅", accent: "bg-purple-500", badge: "bg-purple-50 text-purple-600" },
  DANGER:       { icon: "⚠️", accent: "bg-red-500",    badge: "bg-red-50 text-red-600"       },
  JAM:          { icon: "🚗", accent: "bg-amber-500",  badge: "bg-amber-50 text-amber-600"   },
  ROAD:         { icon: "🚧", accent: "bg-orange-500", badge: "bg-orange-50 text-orange-600" },
  POLL:         { icon: "🗳️", accent: "bg-blue-500",   badge: "bg-blue-50 text-blue-600"     },
  INFO:         { icon: "ℹ️", accent: "bg-blue-400",   badge: "bg-blue-50 text-blue-600"     },
  default:      { icon: "🔔", accent: "bg-gray-400",   badge: "bg-gray-50 text-gray-600"     },
};

function gradientFor(p: Project) {
  const t = p.project_type ?? p.type ?? "";
  return TYPE_GRADIENT[t] ?? TYPE_GRADIENT.default;
}

function imgSrcFor(p: Project) {
  if (!p.image_url) return null;
  return p.image_url.startsWith("http") ? p.image_url : `${API}${p.image_url}`;
}

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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function CitizensOverviewPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/notifications`),
      fetch(`${API}/projects`),
    ]).then(([notifRes, projRes]) => {
      if (notifRes.status === "fulfilled" && notifRes.value.ok)
        notifRes.value.json().then((d: Notification[]) => setNotifications(d.slice(0, 4)));
      if (projRes.status === "fulfilled" && projRes.value.ok)
        projRes.value.json().then((d: Project[]) => setProjects(d));
    }).finally(() => setLoading(false));
  }, []);

  const gridProjects = projects.slice(0, 4);
  const sponsoredProjects = projects.slice(4, 8);

  function handleCarouselScroll() {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const cardW = el.scrollWidth / Math.max(sponsoredProjects.length, 1);
    setCarouselIdx(Math.round(el.scrollLeft / cardW));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">Loading your city…</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0 && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
          style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
          🏙️
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">Nothing here yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon for updates from Alatau City.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Hero header */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">{greeting()}</p>
            <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">Alatau District</p>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            Change district
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-4">
          {[
            { label: "Projects", value: projects.length, color: "text-blue-600" },
            { label: "Alerts",   value: notifications.length, color: "text-amber-600" },
            { label: "Active",   value: projects.filter(p => p.status === "active").length, color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 p-4 pb-8">

        {/* ── Notifications ── */}
        {notifications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Notifications</p>
              <Link href="/citizens/notifications" className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                See all →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {notifications.map((n) => {
                const cfg = NOTIF_CFG[n.type ?? ""] ?? NOTIF_CFG.default;
                return (
                  <Link key={n.id} href="/citizens/notifications">
                    <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${cfg.badge}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">{timeAgo(n.created_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── You might be interested in ── */}
        {gridProjects.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">You might be interested in</p>
            <div className="grid grid-cols-2 gap-3">
              {gridProjects.map((p) => {
                const src = imgSrcFor(p);
                return (
                  <div key={p.id} className="rounded-2xl overflow-hidden shadow-sm relative" style={{ minHeight: 156 }}>
                    {src ? (
                      <img src={src} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: gradientFor(p) }} />
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.78) 100%)" }} />
                    <div className="relative flex flex-col justify-end h-full px-3 py-3" style={{ minHeight: 156 }}>
                      {p.status && (
                        <span className="self-start mb-1.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
                          {p.status}
                        </span>
                      )}
                      <p className="text-sm font-bold text-white leading-tight line-clamp-2">{p.name}</p>
                      {p.description && (
                        <p className="text-[10px] text-white/70 mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                      {p.completion_pct != null && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-white/60 font-medium">Progress</span>
                            <span className="text-[9px] text-white/80 font-bold">{p.completion_pct}%</span>
                          </div>
                          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${p.completion_pct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Sponsored ── */}
        {sponsoredProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">Sponsored</p>
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded tracking-wider">AD</span>
              </div>
              <span className="text-[10px] text-gray-400">{carouselIdx + 1} / {sponsoredProjects.length}</span>
            </div>
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", paddingBottom: 2 }}
            >
              {sponsoredProjects.map((p) => {
                const src = imgSrcFor(p);
                return (
                  <div key={p.id} className="snap-start shrink-0 w-[78vw] max-w-[300px] rounded-2xl overflow-hidden shadow-sm relative" style={{ minHeight: 190 }}>
                    {src ? (
                      <img src={src} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: gradientFor(p) }} />
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 15%, rgba(0,0,0,0.82) 100%)" }} />
                    <div className="relative flex flex-col justify-end h-full px-4 py-4" style={{ minHeight: 190 }}>
                      {p.status && (
                        <span className="self-start mb-1.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
                          {p.status}
                        </span>
                      )}
                      <p className="text-base font-bold text-white leading-tight">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-white/70 mt-1 line-clamp-2 leading-snug">{p.description}</p>
                      )}
                      {p.completion_pct != null && (
                        <div className="mt-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${p.completion_pct}%` }} />
                            </div>
                            <span className="text-[10px] text-white/70 font-semibold shrink-0">{p.completion_pct}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {sponsoredProjects.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {sponsoredProjects.map((_, i) => (
                  <span key={i} className={`rounded-full transition-all duration-300 ${i === carouselIdx ? "w-5 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-gray-300"}`} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
