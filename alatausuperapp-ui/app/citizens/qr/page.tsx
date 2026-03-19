"use client";

export default function CitizensQrPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-6">
      <div className="flex items-center justify-center w-48 h-48 rounded-3xl bg-white border-2 border-gray-200 shadow-sm">
        {/* QR placeholder grid */}
        <svg viewBox="0 0 80 80" className="w-36 h-36 text-gray-800">
          {/* Top-left finder */}
          <rect x="4" y="4" width="22" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
          <rect x="10" y="10" width="10" height="10" fill="currentColor"/>
          {/* Top-right finder */}
          <rect x="54" y="4" width="22" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
          <rect x="60" y="10" width="10" height="10" fill="currentColor"/>
          {/* Bottom-left finder */}
          <rect x="4" y="54" width="22" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
          <rect x="10" y="60" width="10" height="10" fill="currentColor"/>
          {/* Data dots */}
          <rect x="32" y="4" width="6" height="6" fill="currentColor"/>
          <rect x="40" y="4" width="6" height="6" fill="currentColor"/>
          <rect x="32" y="12" width="6" height="6" fill="currentColor"/>
          <rect x="32" y="32" width="6" height="6" fill="currentColor"/>
          <rect x="40" y="40" width="6" height="6" fill="currentColor"/>
          <rect x="48" y="32" width="6" height="6" fill="currentColor"/>
          <rect x="56" y="40" width="6" height="6" fill="currentColor"/>
          <rect x="64" y="32" width="6" height="6" fill="currentColor"/>
          <rect x="32" y="56" width="6" height="6" fill="currentColor"/>
          <rect x="40" y="64" width="6" height="6" fill="currentColor"/>
          <rect x="48" y="56" width="6" height="6" fill="currentColor"/>
          <rect x="56" y="64" width="6" height="6" fill="currentColor"/>
          <rect x="64" y="56" width="6" height="6" fill="currentColor"/>
          <rect x="70" y="64" width="6" height="6" fill="currentColor"/>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900">Your Citizen QR Code</p>
        <p className="text-xs text-gray-400 mt-1">Show this at government service centres</p>
      </div>

      <button
        className="w-full max-w-xs py-3 rounded-2xl text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}
      >
        Save to Gallery
      </button>
    </div>
  );
}
