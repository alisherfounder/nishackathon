"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000";

interface Sensor {
  id: string; name?: string; aqi: number; pm25?: number; lat?: number; lon?: number; recorded_at?: string;
}

function aqiLabel(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "text-green-600", bg: "bg-green-50", bar: "bg-green-500" };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50", bar: "bg-yellow-500" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-500" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-600", bg: "bg-red-50", bar: "bg-red-500" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-600", bg: "bg-purple-50", bar: "bg-purple-500" };
  return { label: "Hazardous", color: "text-rose-800", bg: "bg-rose-100", bar: "bg-rose-700" };
}

function LeafIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
}

export default function CitizensOverviewPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/sensors`)
      .then((r) => r.ok ? r.json() : [])
      .then(setSensors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgAqi = sensors.length > 0 ? Math.round(sensors.reduce((s, x) => s + x.aqi, 0) / sensors.length) : 0;
  const avgPm25 = sensors.length > 0 ? (sensors.reduce((s, x) => s + (x.pm25 ?? 0), 0) / sensors.length).toFixed(1) : "—";
  const avgInfo = aqiLabel(avgAqi);

  if (loading) {
    return <div className="flex items-center justify-center min-h-64"><div className="text-gray-400 text-sm">Loading...</div></div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">Air Quality</h1>
        <p className="text-xs text-gray-400 mt-0.5">Live readings from {sensors.length} sensors across Alatau</p>
      </div>

      {/* City average card */}
      <div className={`rounded-2xl border p-6 mb-5 ${avgInfo.bg}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City Average AQI</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${avgInfo.bg}`} style={{ color: "inherit" }}>
            <LeafIcon />
          </div>
        </div>
        <p className={`text-5xl font-bold mb-1 ${avgInfo.color}`}>{avgAqi}</p>
        <p className={`text-sm font-semibold ${avgInfo.color}`}>{avgInfo.label}</p>
        <div className="mt-4 h-2 bg-white/60 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${avgInfo.bar}`} style={{ width: `${Math.min((avgAqi / 300) * 100, 100)}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>PM2.5: {avgPm25} µg/m³</span>
          <span>{sensors.length} stations</span>
        </div>
      </div>

      {/* AQI scale */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">AQI Scale</p>
        <div className="flex flex-col gap-2">
          {[
            { range: "0–50", label: "Good", color: "bg-green-500" },
            { range: "51–100", label: "Moderate", color: "bg-yellow-500" },
            { range: "101–150", label: "Unhealthy for Sensitive Groups", color: "bg-orange-500" },
            { range: "151–200", label: "Unhealthy", color: "bg-red-500" },
            { range: "201–300", label: "Very Unhealthy", color: "bg-purple-500" },
          ].map((row) => (
            <div key={row.range} className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full shrink-0 ${row.color}`} />
              <span className="text-xs text-gray-600 flex-1">{row.label}</span>
              <span className="text-xs text-gray-400 font-mono">{row.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor list */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Sensor Stations</p>
        <div className="flex flex-col gap-3">
          {sensors.map((sensor) => {
            const info = aqiLabel(sensor.aqi);
            return (
              <div key={sensor.id} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{sensor.name ?? "Sensor"}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.bg} ${info.color}`}>{info.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-bold ${info.color}`}>{sensor.aqi}</p>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${info.bar}`} style={{ width: `${Math.min((sensor.aqi / 300) * 100, 100)}%` }} />
                    </div>
                    {sensor.pm25 != null && <p className="text-xs text-gray-400 mt-1">PM2.5: {sensor.pm25} µg/m³</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
