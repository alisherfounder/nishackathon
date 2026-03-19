"use client";

import { useEffect, useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, PathLayer } from "deck.gl";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const API = process.env.NEXT_PUBLIC_API ?? "/api";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 77.05, latitude: 43.55, zoom: 10, pitch: 30, bearing: 0,
};

interface Project { id: string; title: string; institution: string; status: string; lat?: number; lon?: number; }
interface NotificationItem { id: string; type: string; title: string; body?: string; lat?: number; lon?: number; geometry?: string; }
interface RoadItem { id: string; title: string; path: [number, number][]; }
interface ReportItem { id: string; title: string; description?: string; status: string; lat?: number; lon?: number; }
interface TooltipData { x: number; y: number; title: string; subtitle: string; }

// Keep in sync with government map
const STATUS_FILL: Record<string, [number, number, number, number]> = {
  active:    [106, 148, 245, 220],
  planned:   [160, 196, 255, 200],
  completed: [113, 113, 122, 160],
};

export default function CitizensMapClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [jams, setJams] = useState<NotificationItem[]>([]);
  const [dangers, setDangers] = useState<NotificationItem[]>([]);
  const [roads, setRoads] = useState<RoadItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Report modal
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [pickingMode, setPickingMode] = useState(false);

  const fetchData = useCallback(async () => {
    const [projRes, jamRes, dangerRes, roadRes, repRes] = await Promise.allSettled([
      fetch(`${API}/projects`),
      fetch(`${API}/notifications?type=JAM`),
      fetch(`${API}/notifications?type=DANGER`),
      fetch(`${API}/notifications?type=ROAD`),
      fetch(`${API}/reports`),
    ]);
    if (projRes.status === "fulfilled" && projRes.value.ok) setProjects(await projRes.value.json());
    if (jamRes.status === "fulfilled" && jamRes.value.ok) setJams(await jamRes.value.json());
    if (dangerRes.status === "fulfilled" && dangerRes.value.ok) setDangers(await dangerRes.value.json());
    if (roadRes.status === "fulfilled" && roadRes.value.ok) {
      const rawRoads: NotificationItem[] = await roadRes.value.json();
      setRoads(rawRoads.filter((r) => r.geometry).map((r) => ({ id: r.id, title: r.title, path: JSON.parse(r.geometry!) as [number, number][] })));
    }
    if (repRes.status === "fulfilled" && repRes.value.ok) setReports(await repRes.value.json());
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const geoProjects = projects.filter((p) => p.lat != null && p.lon != null);
  const geoJams = jams.filter((j) => j.lat != null && j.lon != null);
  const geoDangers = dangers.filter((d) => d.lat != null && d.lon != null);
  const geoReports = reports.filter((r) => r.lat != null && r.lon != null);

  const layers = [
    ...(roads.length > 0 ? [new PathLayer({ id: "roads", data: roads, getPath: (d: RoadItem) => d.path, getWidth: 5, getColor: [249, 115, 22, 200] as [number, number, number, number], widthMinPixels: 3, capRounded: true, jointRounded: true, pickable: true, onHover: ({ object, x, y }: { object?: RoadItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: "Road Work" } : null); } })] : []),
    ...(geoProjects.length > 0 ? [new ScatterplotLayer({ id: "projects", data: geoProjects, getPosition: (d: Project) => [d.lon!, d.lat!], getRadius: 60, getFillColor: (d: Project) => STATUS_FILL[d.status] ?? STATUS_FILL.completed, getLineColor: [255, 255, 255, 100], lineWidthMinPixels: 1, stroked: true, pickable: true, radiusMinPixels: 6, radiusMaxPixels: 18, onHover: ({ object, x, y }: { object?: Project; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: `${object.institution} · ${object.status}` } : null); } })] : []),
    ...(geoJams.length > 0 ? [new ScatterplotLayer({ id: "traffic", data: geoJams, getPosition: (d: NotificationItem) => [d.lon!, d.lat!], getRadius: 50, getFillColor: [245, 158, 11, 180] as [number, number, number, number], getLineColor: [245, 158, 11, 255] as [number, number, number, number], lineWidthMinPixels: 2, stroked: true, pickable: true, radiusMinPixels: 5, radiusMaxPixels: 14, onHover: ({ object, x, y }: { object?: NotificationItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: "Traffic Jam" } : null); } })] : []),
    ...(geoDangers.length > 0 ? [new ScatterplotLayer({ id: "danger", data: geoDangers, getPosition: (d: NotificationItem) => [d.lon!, d.lat!], getRadius: 70, getFillColor: [239, 68, 68, 180] as [number, number, number, number], getLineColor: [239, 68, 68, 255] as [number, number, number, number], lineWidthMinPixels: 2, stroked: true, pickable: true, radiusMinPixels: 7, radiusMaxPixels: 18, onHover: ({ object, x, y }: { object?: NotificationItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: "Danger Zone" } : null); } })] : []),
    ...(geoReports.length > 0 ? [new ScatterplotLayer({ id: "reports", data: geoReports, getPosition: (d: ReportItem) => [d.lon!, d.lat!], getRadius: 55, getFillColor: [147, 51, 234, 200] as [number, number, number, number], getLineColor: [147, 51, 234, 255] as [number, number, number, number], lineWidthMinPixels: 2, stroked: true, pickable: true, radiusMinPixels: 6, radiusMaxPixels: 16, onHover: ({ object, x, y }: { object?: ReportItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: `Report · ${object.status}` } : null); } })] : []),
  ];

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.title.trim() || !clickedCoords) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportForm.title.trim(),
          description: reportForm.description.trim() || undefined,
          lat: clickedCoords.lat,
          lon: clickedCoords.lon,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        fetchData();
        setTimeout(() => {
          setShowReport(false);
          setSubmitted(false);
          setReportForm({ title: "", description: "" });
          setClickedCoords(null);
          setPickingMode(false);
        }, 1500);
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  return (
    <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2.5 shadow-lg">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgb(106,148,245)" }} /><span className="text-gray-600 text-xs">Active Project</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgb(160,196,255)" }} /><span className="text-gray-600 text-xs">Planned Project</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-gray-600 text-xs">Traffic Jam</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-gray-600 text-xs">Danger Zone</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-1 rounded-full bg-orange-500" /><span className="text-gray-600 text-xs">Road Work</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-600" /><span className="text-gray-600 text-xs">Report</span></div>
        </div>
      </div>

      {/* Stats bubble */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-center">
        <p className="text-xs text-gray-400">Active</p>
        <p className="text-lg font-bold text-blue-500">{geoProjects.filter((p) => p.status === "active").length}</p>
        <p className="text-[10px] text-gray-400">projects</p>
      </div>

      {/* Report Issue FAB */}
      {!pickingMode && (
        <button
          onClick={() => { setPickingMode(true); setClickedCoords(null); setSubmitted(false); }}
          className="absolute bottom-5 right-4 z-10 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Report Issue
        </button>
      )}

      {/* Picking mode banner */}
      {pickingMode && !showReport && (
        <div className="absolute bottom-5 left-4 right-4 z-10 flex items-center justify-between gap-3 rounded-2xl bg-blue-600 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-sm font-semibold">Tap a location on the map</span>
          </div>
          <button onClick={() => { setPickingMode(false); setClickedCoords(null); }} className="text-white/70 hover:text-white text-xs font-medium">
            Cancel
          </button>
        </div>
      )}

      {tooltip && (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg pointer-events-none" style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}>
          <p className="text-gray-900 text-sm font-medium">{tooltip.title}</p>
          <p className="text-gray-400 text-xs mt-0.5">{tooltip.subtitle}</p>
        </div>
      )}

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getCursor={({ isHovering }) => pickingMode ? "crosshair" : (isHovering ? "pointer" : "grab")}
        onClick={({ coordinate }) => {
          if (!pickingMode || !coordinate) return;
          setClickedCoords({ lon: coordinate[0], lat: coordinate[1] });
          setShowReport(true);
        }}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>

      {/* Report modal */}
      {showReport && (
        <div className="absolute inset-0 z-30 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 shadow-2xl">
            {submitted ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
                <p className="text-base font-bold text-gray-900">Report Submitted</p>
                <p className="text-sm text-gray-400">Thank you for helping improve the city</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-gray-900">Report Issue</p>
                  <button type="button" onClick={() => { setShowReport(false); setPickingMode(false); setClickedCoords(null); }} className="text-gray-400 hover:text-gray-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Coords badge */}
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="text-xs text-blue-700 font-mono">
                    {clickedCoords?.lat.toFixed(5)}, {clickedCoords?.lon.toFixed(5)}
                  </p>
                  <span className="text-[10px] text-blue-400 ml-auto">selected</span>
                </div>

                <input
                  required
                  placeholder="Title *"
                  value={reportForm.title}
                  onChange={(e) => setReportForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <textarea
                  placeholder="Description (optional)"
                  rows={3}
                  value={reportForm.description}
                  onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
