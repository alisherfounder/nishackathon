"use client";

import { useState } from "react";
import Link from "next/link";

const LANGS = ["English", "Қазақша", "Русский"];

const NOTIF_ITEMS = [
  { key: "service_updates", label: "Service Updates", sub: "Status changes on your requests" },
  { key: "city_alerts",     label: "City Alerts",     sub: "Emergency and safety notifications" },
  { key: "new_polls",       label: "New Polls",        sub: "Community voting events" },
  { key: "air_quality",     label: "Air Quality",      sub: "AQI threshold alerts" },
];

export default function CitizensSettingsPage() {
  const [lang, setLang] = useState("English");
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    service_updates: true,
    city_alerts: true,
    new_polls: false,
    air_quality: true,
  });

  function toggleNotif(key: string) {
    setNotifs((n) => ({ ...n, [key]: !n[key] }));
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-xl font-bold"
          style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}>
          C
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Citizen</p>
          <p className="text-xs text-gray-400">Alatau District</p>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Language</p>
        <div className="flex flex-col gap-2">
          {LANGS.map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${lang === l ? "border-teal-400 bg-teal-50 text-teal-700" : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"}`}>
              {l}
              {lang === l && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-teal-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Notifications</p>
        <div className="flex flex-col gap-3">
          {NOTIF_ITEMS.map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <button onClick={() => toggleNotif(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${notifs[key] ? "bg-teal-500" : "bg-gray-200"}`}>
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${notifs[key] ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Switch portal */}
      <Link href="/"
        className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        ← Switch to Government Portal
      </Link>
    </div>
  );
}
