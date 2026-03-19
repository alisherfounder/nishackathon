"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function VoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M9 22V12h6v10" />
      <path d="M9 7h1" />
      <path d="M9 11h1" />
      <path d="M14 7h1" />
      <path d="M14 11h1" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/government", label: "Home", Icon: HomeIcon, badgeKey: null },
  { href: "/government/map", label: "Map", Icon: MapIcon, badgeKey: null },
  { href: "/government/notifications", label: "Notifications", Icon: BellIcon, badgeKey: "notif" },
  { href: "/government/polls", label: "Voting", Icon: VoteIcon, badgeKey: "polls" },
  { href: "/government/projects", label: "Projects", Icon: SettingsIcon, badgeKey: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/notifications`),
      fetch(`${API}/polls`),
    ]).then(([notifRes, pollsRes]) => {
      if (notifRes.status === "fulfilled" && notifRes.value.ok) {
        notifRes.value.json().then((data: unknown[]) => setNotifCount(data.length));
      }
      if (pollsRes.status === "fulfilled" && pollsRes.value.ok) {
        pollsRes.value.json().then((data: { is_active: boolean }[]) =>
          setPollCount(data.filter((p) => p.is_active).length)
        );
      }
    });
  }, []);

  const badges: Record<string, number> = { notif: notifCount, polls: pollCount };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col bg-white border-r border-gray-100">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)" }}
        >
          <BuildingIcon />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Alatau City</p>
          <p className="text-xs text-gray-400 leading-tight">Smart City</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search objects..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Menu label */}
      <div className="px-5 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {NAV_ITEMS.map(({ href, label, Icon, badgeKey }) => {
          const isActive =
            href === "/government" ? pathname === "/government" : pathname.startsWith(href);
          const count = badgeKey ? badges[badgeKey] : 0;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Administrator</p>
            <p className="text-xs text-gray-400 leading-tight truncate">Developer · Akim</p>
          </div>
          <SettingsIcon className="w-4 h-4 text-gray-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
