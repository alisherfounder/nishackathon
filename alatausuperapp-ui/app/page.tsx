import Link from "next/link";

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M9 22V12h6v10M9 7h1M14 7h1M9 11h1M14 11h1" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)" }}
        >
          <BuildingIcon />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Alatau City</h1>
          <p className="text-sm text-gray-400 mt-0.5">Smart City Platform</p>
        </div>
      </div>

      {/* Portal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        <Link href="/government">
          <div className="group rounded-2xl bg-white border border-gray-200 p-7 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white mb-5"
              style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}
            >
              <BuildingIcon />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              Government Portal
            </h2>
            <p className="text-sm text-gray-400">
              Manage projects, publish alerts, and review citizen polls.
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-blue-500">
              Enter portal
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/citizens">
          <div className="group rounded-2xl bg-white border border-gray-200 p-7 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white mb-5"
              style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}
            >
              <MapIcon />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
              Citizens Portal
            </h2>
            <p className="text-sm text-gray-400">
              Explore the city map, check alerts, and participate in votes.
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-medium text-teal-500">
              Enter portal
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-10 text-xs text-gray-400">Alatau SuperApp · Hackathon 2026</p>
    </div>
  );
}
