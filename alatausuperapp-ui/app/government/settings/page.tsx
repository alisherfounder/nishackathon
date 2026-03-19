"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Icons ────────────────────────────────────────────────────────────────────

function HeartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function GlobeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>; }
function BellIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>; }
function MapIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }
function HelpIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function ChevronRightIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>; }
function CameraIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>; }

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "edit-profile" | "favorites" | "language" | "notifications-settings" | "theme" | "map-settings" | "privacy" | "help";

const SETTINGS_SECTIONS = [
  { id: "language" as Section,                label: "Language",      Icon: GlobeIcon  },
  { id: "notifications-settings" as Section,  label: "Notifications", Icon: BellIcon   },
  { id: "theme" as Section,                   label: "Theme",         Icon: MoonIcon   },
  { id: "map-settings" as Section,            label: "Map",           Icon: MapIcon    },
  { id: "privacy" as Section,                 label: "Privacy",       Icon: ShieldIcon },
  { id: "help" as Section,                    label: "Help",          Icon: HelpIcon   },
];

// ─── Placeholder panel ────────────────────────────────────────────────────────

function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        <HelpIcon />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

// ─── Edit Profile panel ───────────────────────────────────────────────────────

function EditProfilePanel() {
  const [profile, setProfile] = useState({
    name: "Administrator",
    email: "admin@alataicity.kz",
    phone: "+7 727 123 45 67",
    role: "District Administrator",
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const INPUT = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Edit Profile</h2>
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        {/* Avatar row */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
              A
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
              <CameraIcon />
            </button>
          </div>
          <div>
            <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              Change photo
            </button>
            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG up to 5 MB</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Role</label>
            <input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className={INPUT} />
          </div>
          <button type="submit"
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: saved ? "#16a34a" : "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
            {saved ? "✓ Changes saved" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GovernmentSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("edit-profile");

  function renderPanel() {
    switch (activeSection) {
      case "edit-profile": return <EditProfilePanel />;
      case "favorites":    return <PlaceholderPanel title="Favorites" description="Saved projects and alerts will appear here." />;
      case "language":     return <LanguagePanel />;
      case "notifications-settings": return <NotificationsPanel />;
      case "theme":        return <ThemePanel />;
      case "map-settings": return <PlaceholderPanel title="Map Settings" description="Configure default map layers and tile provider." />;
      case "privacy":      return <PlaceholderPanel title="Privacy" description="Manage data sharing and visibility preferences." />;
      case "help":         return <HelpPanel />;
      default:             return null;
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      {/* Left panel */}
      <aside className="w-64 shrink-0 border-r border-gray-100 bg-white p-5 flex flex-col gap-5">
        {/* Profile card */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-base font-bold">
              A
            </div>
            <button className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 shadow-sm hover:bg-gray-50">
              <CameraIcon />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Administrator</p>
            <p className="text-xs text-gray-400 truncate">admin@alataicity.kz</p>
          </div>
        </div>

        {/* Profile section */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Profile</p>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => setActiveSection("favorites")}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${activeSection === "favorites" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
              <HeartIcon />
              <span className="flex-1 text-left">Favorites</span>
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">7</span>
            </button>
            <button onClick={() => setActiveSection("edit-profile")}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${activeSection === "edit-profile" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
              <EditIcon />
              Edit Profile
            </button>
          </div>
        </div>

        {/* All settings section */}
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">All Settings</p>
          <div className="flex flex-col gap-0.5">
            {SETTINGS_SECTIONS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${activeSection === id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                <Icon />
                <span className="flex-1 text-left">{label}</span>
                <ChevronRightIcon />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <Link href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogoutIcon />
          Log out
        </Link>
      </aside>

      {/* Right panel */}
      <main className="flex-1 p-8 max-w-2xl">
        {renderPanel()}
      </main>
    </div>
  );
}

// ─── Extra panels ─────────────────────────────────────────────────────────────

function LanguagePanel() {
  const [lang, setLang] = useState("en");
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Language</h2>
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {[["en", "English"], ["kk", "Қазақша"], ["ru", "Русский"]].map(([code, label]) => (
          <button key={code} onClick={() => setLang(code)}
            className={`w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 text-sm transition-colors hover:bg-gray-50 ${lang === code ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
            {label}
            {lang === code && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [settings, setSettings] = useState({ push: true, email: true, sms: false, dangerAlerts: true, projectUpdates: true, polls: false });
  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Notifications</h2>
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {([
          ["push", "Push notifications", "In-app alerts"],
          ["email", "Email notifications", "Sent to admin@alataicity.kz"],
          ["sms", "SMS notifications", "Sent to +7 727 123 45 67"],
          ["dangerAlerts", "Danger alerts", "Critical city alerts"],
          ["projectUpdates", "Project updates", "Status changes on projects"],
          ["polls", "Poll activity", "New votes and results"],
        ] as [keyof typeof settings, string, string][]).map(([key, label, sub]) => (
          <div key={key} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <button onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[key] ? "bg-blue-500" : "bg-gray-200"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[key] ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemePanel() {
  const [theme, setTheme] = useState("light");
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Theme</h2>
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: "light", label: "Light", preview: "bg-white border-2 border-gray-200" },
          { id: "dark",  label: "Dark",  preview: "bg-gray-900 border-2 border-gray-700" },
          { id: "auto",  label: "Auto",  preview: "bg-gradient-to-br from-white to-gray-900 border-2 border-gray-300" },
        ].map(({ id, label, preview }) => (
          <button key={id} onClick={() => setTheme(id)}
            className={`rounded-2xl overflow-hidden border-2 transition-all ${theme === id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 hover:border-gray-300"}`}>
            <div className={`h-20 ${preview}`} />
            <div className="py-2 px-3 bg-white">
              <p className={`text-xs font-semibold ${theme === id ? "text-blue-600" : "text-gray-600"}`}>{label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HelpPanel() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Help & Support</h2>
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {[
          ["Getting started guide", "Learn how to use the platform"],
          ["Report a problem", "Submit a bug or feedback"],
          ["Contact support", "support@alataicity.kz"],
          ["Platform version", "Alatau SuperApp v0.1 · Hackathon 2026"],
        ].map(([label, sub]) => (
          <div key={label} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <ChevronRightIcon />
          </div>
        ))}
      </div>
    </div>
  );
}
