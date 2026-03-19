"use client";

import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/government": { title: "Home", subtitle: "Alatau, Kazakhstan" },
  "/government/map": { title: "Map", subtitle: "Alatau, Kazakhstan" },
  "/government/requests": { title: "Requests", subtitle: "Citizen & business submissions" },
  "/government/notifications": { title: "Notifications", subtitle: "Alerts & updates" },
  "/government/polls": { title: "Voting", subtitle: "Community polls" },
  "/government/projects": { title: "Projects", subtitle: "Infrastructure projects" },
  "/government/settings": { title: "Settings", subtitle: "Account management" },
};

function GovernmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function TopHeader() {
  const pathname = usePathname();

  const matchedKey = Object.keys(PAGE_META)
    .filter((k) => (k === "/government" ? pathname === "/government" : pathname.startsWith(k)))
    .sort((a, b) => b.length - a.length)[0];

  const meta = PAGE_META[matchedKey] ?? { title: "Alatau City", subtitle: "Alatau, Kazakhstan" };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-100 px-8 py-4">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{meta.title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{meta.subtitle}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Government badge */}
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <GovernmentIcon />
          Government of RK
        </button>

        {/* District selector */}
        <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-500">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          Alatau
          <ChevronDownIcon />
        </button>

        {/* Bell with dot */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
