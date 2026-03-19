"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function MapIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>;
}
function BellIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function LeafIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
}

function QrIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" /><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" /><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" /><path d="M14 14h3v3" /><path d="M17 17v4" /><path d="M21 14v3h-4" /></svg>;
}

function SettingsIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
}

const NAV = [
  { href: "/citizens/overview", label: "Overview", Icon: LeafIcon },
  { href: "/citizens/notifications", label: "Messages",  Icon: BellIcon     },
  { href: "/citizens/map",           label: "Map",       Icon: MapIcon      },
  { href: "/citizens/qr",            label: "QR",        Icon: QrIcon       },
  { href: "/citizens/settings",      label: "Settings",  Icon: SettingsIcon },
];

export default function CitizensLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Alatau City</p>
            <p className="text-[10px] text-gray-400 leading-tight">Citizens Portal</p>
          </div>
        </div>
        <Link href="/" className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors">← Switch portal</Link>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${active ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`}>
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
