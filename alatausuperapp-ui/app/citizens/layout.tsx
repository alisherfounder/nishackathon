"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function MapIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>;
}
function BellIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function BotIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M12 11V7" /><circle cx="12" cy="5" r="2" /><path d="M8 15h.01M16 15h.01" /></svg>;
}
function LeafIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
}

function ClipboardIcon({ active }: { active: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></svg>;
}

const NAV = [
  { href: "/citizens/map", label: "Map", Icon: MapIcon },
  { href: "/citizens/notifications", label: "Alerts", Icon: BellIcon },
  { href: "/citizens/requests", label: "Requests", Icon: ClipboardIcon },
  { href: "/citizens/ai", label: "AI", Icon: BotIcon },
  { href: "/citizens/overview", label: "Air", Icon: LeafIcon },
];

export default function CitizensLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}>
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Alatau City</p>
            <p className="text-[10px] text-gray-400 leading-tight">Citizens Portal</p>
          </div>
        </div>
        <Link href="/" className="text-xs text-teal-500 font-medium hover:text-teal-600 transition-colors">← Switch portal</Link>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${active ? "text-teal-500" : "text-gray-400 hover:text-gray-600"}`}>
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
