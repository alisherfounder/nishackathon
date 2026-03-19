"use client";

import { useEffect, useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, PathLayer } from "deck.gl";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const API = "http://localhost:8000";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 77.05, latitude: 43.55, zoom: 10, pitch: 30, bearing: 0,
};

interface Project { id: string; title: string; institution: string; status: string; lat?: number; lon?: number; }
interface NotificationItem { id: string; type: string; title: string; body?: string; lat?: number; lon?: number; geometry?: string; }
interface RoadItem { id: string; title: string; path: [number, number][]; }

interface TooltipData { x: number; y: number; title: string; subtitle: string; }

const STATUS_FILL: Record<string, [number, number, number, number]> = {
  active: [13, 148, 136, 220],
  planned: [20, 184, 166, 180],
  completed: [113, 113, 122, 140],
};

export default function CitizensMapClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [jams, setJams] = useState<NotificationItem[]>([]);
  const [dangers, setDangers] = useState<NotificationItem[]>([]);
  const [roads, setRoads] = useState<RoadItem[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const fetchData = useCallback(async () => {
    const [projRes, jamRes, dangerRes, roadRes] = await Promise.allSettled([
      fetch(`${API}/projects`),
      fetch(`${API}/notifications?type=JAM`),
      fetch(`${API}/notifications?type=DANGER`),
      fetch(`${API}/notifications?type=ROAD`),
    ]);
    if (projRes.status === "fulfilled" && projRes.value.ok) setProjects(await projRes.value.json());
    if (jamRes.status === "fulfilled" && jamRes.value.ok) setJams(await jamRes.value.json());
    if (dangerRes.status === "fulfilled" && dangerRes.value.ok) setDangers(await dangerRes.value.json());
    if (roadRes.status === "fulfilled" && roadRes.value.ok) {
      const rawRoads: NotificationItem[] = await roadRes.value.json();
      setRoads(rawRoads.filter((r) => r.geometry).map((r) => ({ id: r.id, title: r.title, path: JSON.parse(r.geometry!) as [number, number][] })));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const geoProjects = projects.filter((p) => p.lat != null && p.lon != null);
  const geoJams = jams.filter((j) => j.lat != null && j.lon != null);
  const geoDangers = dangers.filter((d) => d.lat != null && d.lon != null);

  const layers = [
    ...(roads.length > 0 ? [new PathLayer({ id: "roads", data: roads, getPath: (d: RoadItem) => d.path, getWidth: 5, getColor: [249, 115, 22, 200] as [number, number, number, number], widthMinPixels: 3, capRounded: true, jointRounded: true, pickable: true, onHover: ({ object, x, y }: { object?: RoadItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: "Road Work" } : null); } })] : []),
    ...(geoProjects.length > 0 ? [new ScatterplotLayer({ id: "projects", data: geoProjects, getPosition: (d: Project) => [d.lon!, d.lat!], getRadius: 60, getFillColor: (d: Project) => STATUS_FILL[d.status] ?? STATUS_FILL.completed, getLineColor: [255, 255, 255, 100], lineWidthMinPixels: 1, stroked: true, pickable: true, radiusMinPixels: 6, radiusMaxPixels: 18, onHover: ({ object, x, y }: { object?: Project; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: `${object.institution} · ${object.status}` } : null); } })] : []),
    ...(geoJams.length > 0 ? [new ScatterplotLayer({ id: "traffic", data: geoJams, getPosition: (d: NotificationItem) => [d.lon!, d.lat!], getRadius: 50, getFillColor: [245, 158, 11, 180] as [number, number, number, number], getLineColor: [245, 158, 11, 255] as [number, number, number, number], lineWidthMinPixels: 2, stroked: true, pickable: true, radiusMinPixels: 5, radiusMaxPixels: 14, onHover: ({ object, x, y }: { object?: NotificationItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: "Traffic Jam" } : null); } })] : []),
    ...(geoDangers.length > 0 ? [new ScatterplotLayer({ id: "danger", data: geoDangers, getPosition: (d: NotificationItem) => [d.lon!, d.lat!], getRadius: 70, getFillColor: [239, 68, 68, 180] as [number, number, number, number], getLineColor: [239, 68, 68, 255] as [number, number, number, number], lineWidthMinPixels: 2, stroked: true, pickable: true, radiusMinPixels: 7, radiusMaxPixels: 18, onHover: ({ object, x, y }: { object?: NotificationItem; x: number; y: number }) => { setTooltip(object ? { x, y, title: object.title, subtitle: "Danger Zone" } : null); } })] : []),
  ];

  return (
    <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2.5 shadow-lg">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-teal-500" /><span className="text-gray-600 text-xs">Projects</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-gray-600 text-xs">Traffic</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-gray-600 text-xs">Danger</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-1 rounded-full bg-orange-500" /><span className="text-gray-600 text-xs">Road Work</span></div>
        </div>
      </div>

      {/* Stats bubble */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-center">
        <p className="text-xs text-gray-400">Active</p>
        <p className="text-lg font-bold text-teal-500">{geoProjects.filter((p) => p.status === "active").length}</p>
        <p className="text-[10px] text-gray-400">projects</p>
      </div>

      {tooltip && (
        <div className="absolute z-20 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg pointer-events-none" style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}>
          <p className="text-gray-900 text-sm font-medium">{tooltip.title}</p>
          <p className="text-gray-400 text-xs mt-0.5">{tooltip.subtitle}</p>
        </div>
      )}

      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers} getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}>
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
}
