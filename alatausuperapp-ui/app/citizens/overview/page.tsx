"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API = "http://localhost:8000";

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
  type?: string;
  image_url?: string;
  completion_pct?: number;
  status?: string;
}

const TYPE_GRADIENT: Record<string, string> = {
  road:         "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
  park:         "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
  building:     "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
  utility:      "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
  infrastructure:"linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
  default:      "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
};

function gradientFor(type?: string) {
  return TYPE_GRADIENT[type ?? ""] ?? TYPE_GRADIENT.default;
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
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
        notifRes.value.json().then((d: Notification[]) => setNotifications(d.slice(0, 5)));
      if (projRes.status === "fulfilled" && projRes.value.ok)
        projRes.value.json().then((d: Project[]) => setProjects(d));
    });
  }, []);

  const featured = notifications[0];
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
      {/* Sub-header: district selector */}
      <div className="flex items-center justify-center py-3 bg-white border-b border-gray-100">
        <button className="flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-semibold text-white gap-2"
          style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
          Alatau
          <ChevronDownIcon />
        </button>
      </div>

      <div className="flex flex-col gap-5 p-4 pb-6">

        {/* Last Notifications banner */}
        <Link href="/citizens/notifications" className="block">
          <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: "linear-gradient(135deg, #93b4d4 0%, #b8cfe8 100%)", minHeight: 160 }}>
            <div className="flex flex-col items-center justify-center h-full min-h-[160px] px-6 py-8 text-center">
              {featured ? (
                <>
                  <p className="text-2xl font-extrabold text-white leading-tight drop-shadow">{featured.title}</p>
                  {featured.message && (
                    <p className="text-sm text-white/80 mt-2 line-clamp-2">{featured.message}</p>
                  )}
                </>
              ) : (
                <p className="text-3xl font-extrabold text-white leading-tight drop-shadow">Last<br />notifications</p>
              )}
            </div>
          </div>
        </Link>

        {/* You might be interested in */}
        {gridProjects.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">You might be interested in</p>
            <div className="grid grid-cols-2 gap-3">
              {gridProjects.map((p) => {
                const imgSrc = p.image_url
                  ? (p.image_url.startsWith("http") ? p.image_url : `${API}${p.image_url}`)
                  : null;
                return (
                  <div key={p.id} className="rounded-2xl overflow-hidden shadow-sm aspect-[4/3] relative">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: gradientFor(p.type) }} />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
                      <p className="text-sm font-bold text-white leading-tight line-clamp-2">{p.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sponsored */}
        {sponsoredProjects.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Sponsored</p>
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {sponsoredProjects.map((p) => {
                const imgSrc = p.image_url
                  ? (p.image_url.startsWith("http") ? p.image_url : `${API}${p.image_url}`)
                  : null;
                return (
                  <div key={p.id} className="snap-start shrink-0 w-[65vw] max-w-[260px] rounded-2xl overflow-hidden shadow-sm aspect-[4/3] relative">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: gradientFor(p.type) }} />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
                      <p className="text-sm font-bold text-white leading-tight line-clamp-2">{p.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Carousel dots */}
            {sponsoredProjects.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {sponsoredProjects.map((_, i) => (
                  <span key={i} className={`rounded-full transition-all ${i === carouselIdx ? "w-4 h-1.5 bg-teal-500" : "w-1.5 h-1.5 bg-gray-300"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">No content yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
