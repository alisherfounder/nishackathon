"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/projects", label: "Projects", icon: "☰" },
  { href: "/map", label: "Map", icon: "◉" },
  { href: "/notifications", label: "Notifications", icon: "◈" },
  { href: "/polls", label: "Polls", icon: "☐" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-60 flex-col bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" }}
        >
          A
        </div>
        <span className="text-lg font-semibold tracking-tight text-gray-900">
          Alatau
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={
                isActive
                  ? { background: "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" }
                  : undefined
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">Alatau SuperApp v0.1</p>
      </div>
    </aside>
  );
}
