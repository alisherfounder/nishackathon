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

const NOTIF_TYPE_CFG: Record<string, { icon: string; bg: string; text: string }> = {
  road_closure:  { icon: "🚧", bg: "bg-orange-50", text: "text-orange-700" },
  construction:  { icon: "🏗️", bg: "bg-yellow-50", text: "text-yellow-700" },
  emergency:     { icon: "🚨", bg: "bg-red-50",    text: "text-red-700"    },
  maintenance:   { icon: "🔧", bg: "bg-blue-50",   text: "text-blue-700"  },
  event:         { icon: "📅", bg: "bg-purple-50", text: "text-purple-700" },
  default:       { icon: "🔔", bg: "bg-gray-50",   text: "text-gray-700"  },
};

function gradientFor(p: Project) {
  const t = p.project_type ?? p.type ?? "";
  return TYPE_GRADIENT[t] ?? TYPE_GRADIENT.default;
}

function imgSrcFor(p: Project) {
  if (!p.image_url) return null;
  return p.image_url.startsWith("http") ? p.image_url : `${API}${p.image_url}`;
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
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

export default function CitizensOverviewPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
    });
  }, []);

  const gridProjects = projects.slice(0, 4);
  const sponsoredProjects = projects.slice(4, 8);

  function handleCarouselScroll() {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const cardW = el.scrollWidth / Math.max(sponsoredProjects.length, 1);
    setCarouselIdx(Math.round(el.scrollLeft / cardW));
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* District selector */}
      <div className="flex items-center justify-center py-3 bg-white border-b border-gray-100">
        <button className="flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
          Alatau <ChevronDownIcon />
        </button>
      </div>

      <div className="flex flex-col gap-6 p-4 pb-8">

        {/* ── Notifications ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-bold text-gray-900">Notifications</p>
            <Link href="/citizens/notifications" className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600">
              See all <ArrowRightIcon />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center shadow-sm">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm font-semibold text-gray-700">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((n) => {
                const cfg = NOTIF_TYPE_CFG[n.type ?? ""] ?? NOTIF_TYPE_CFG.default;
                return (
                  <Link key={n.id} href="/citizens/notifications">
                    <div className={`flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── You might be interested in ── */}
        {gridProjects.length > 0 && (
          <div>
            <p className="text-base font-bold text-gray-900 mb-3">You might be interested in</p>
            <div className="grid grid-cols-2 gap-3">
              {gridProjects.map((p) => {
                const src = imgSrcFor(p);
                return (
                  <div key={p.id} className="rounded-2xl overflow-hidden shadow-sm relative flex flex-col" style={{ minHeight: 160 }}>
                    {/* Background */}
                    {src ? (
                      <img src={src} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: gradientFor(p) }} />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75) 100%)" }} />
                    {/* Content */}
                    <div className="relative mt-auto px-3 py-3">
                      <p className="text-sm font-bold text-white leading-tight line-clamp-1">{p.name}</p>
                      {p.description && (
                        <p className="text-[11px] text-white/75 mt-0.5 line-clamp-2 leading-tight">{p.description}</p>
                      )}
                      {p.completion_pct != null && (
                        <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white/80 rounded-full" style={{ width: `${p.completion_pct}%` }} />
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
            <div className="flex items-center gap-2 mb-3">
              <p className="text-base font-bold text-gray-900">Sponsored</p>
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Ad</span>
            </div>
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {sponsoredProjects.map((p) => {
                const src = imgSrcFor(p);
                return (
                  <div key={p.id} className="snap-start shrink-0 w-[72vw] max-w-[280px] rounded-2xl overflow-hidden shadow-sm relative" style={{ minHeight: 180 }}>
                    {src ? (
                      <img src={src} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: gradientFor(p) }} />
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.8) 100%)" }} />
                    <div className="relative mt-auto absolute bottom-0 left-0 right-0 px-4 py-3">
                      <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-white/75 mt-1 line-clamp-2 leading-tight">{p.description}</p>
                      )}
                      {p.completion_pct != null && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white/80 rounded-full" style={{ width: `${p.completion_pct}%` }} />
                          </div>
                          <span className="text-[10px] text-white/70 shrink-0">{p.completion_pct}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {sponsoredProjects.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                {sponsoredProjects.map((_, i) => (
                  <span key={i} className={`rounded-full transition-all ${i === carouselIdx ? "w-4 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-gray-300"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {projects.length === 0 && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <p className="text-4xl">🏙️</p>
            <p className="text-gray-500 font-semibold">Nothing here yet</p>
            <p className="text-gray-400 text-sm">Check back soon for updates from Alatau City.</p>
          </div>
        )}

      </div>
    </div>
  );
}
