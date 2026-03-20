"use client";

import { useState, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, HeatmapLayer, ArcLayer, ColumnLayer } from "deck.gl";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 77.07,
  latitude: 43.62,
  zoom: 8.8,
  pitch: 48,
  bearing: -10,
};

// ── Seed Data ────────────────────────────────────────────────────────────────

interface ProjectData {
  id: string;
  title: string;
  type: string;
  status: string;
  completion: number;
  lat: number;
  lon: number;
}

interface SensorData {
  name: string;
  aqi: number;
  lat: number;
  lon: number;
}

interface DistrictData {
  name: string;
  lat: number;
  lon: number;
  projects: number;
  devScore: number;
}

interface ArcData {
  name: string;
  source: [number, number];
  target: [number, number];
}

const PROJECTS: ProjectData[] = [
  { id: "1", title: "SOM Landmark Tower",          type: "commercial",     status: "planned", completion: 12, lat: 43.6743, lon: 77.1082 },
  { id: "2", title: "A3 Highway Expansion",         type: "infrastructure", status: "active",  completion: 55, lat: 43.4650, lon: 77.0200 },
  { id: "3", title: "Alatau International Airport", type: "infrastructure", status: "planned", completion:  8, lat: 43.7100, lon: 77.0500 },
  { id: "4", title: "Golden District University",   type: "education",      status: "planned", completion: 22, lat: 43.6900, lon: 77.1300 },
  { id: "5", title: "Kapchagay Resort Complex",     type: "tourism",        status: "active",  completion: 68, lat: 43.8300, lon: 77.0800 },
  { id: "6", title: "Smart Traffic System",         type: "tech",           status: "active",  completion: 83, lat: 43.6750, lon: 77.1150 },
  { id: "7", title: "Alatau–Qonaev Light Rail",     type: "infrastructure", status: "planned", completion:  5, lat: 43.7700, lon: 77.0850 },
  { id: "8", title: "CryptoCity Blockchain Hub",    type: "tech",           status: "active",  completion: 41, lat: 43.6800, lon: 77.1000 },
  { id: "9", title: "Ile-Alatau Eco-Tourism Trail", type: "tourism",        status: "planned", completion: 15, lat: 43.4000, lon: 77.0500 },
  { id: "10", title: "Logistics Park",              type: "industrial",     status: "active",  completion: 60, lat: 43.7200, lon: 77.0300 },
];

const SENSORS: SensorData[] = [
  { name: "Gate District Central",      aqi:  45, lat: 43.6743, lon: 77.1082 },
  { name: "Gate District North",        aqi:  52, lat: 43.6800, lon: 77.1150 },
  { name: "Golden District Campus",     aqi:  38, lat: 43.6900, lon: 77.1300 },
  { name: "Growing District Industrial",aqi: 135, lat: 43.7200, lon: 77.0300 },
  { name: "Green District Lakeside",    aqi:  28, lat: 43.8300, lon: 77.0800 },
  { name: "Qonaev City Center",         aqi:  62, lat: 43.8642, lon: 77.0633 },
  { name: "A3 Highway Midpoint",        aqi:  88, lat: 43.4650, lon: 77.0200 },
  { name: "Almaty North Exit",          aqi:  95, lat: 43.3500, lon: 76.9800 },
  { name: "Alatau Airport Zone",        aqi: 110, lat: 43.7100, lon: 77.0500 },
  { name: "Ile-Alatau Foothills",       aqi:  22, lat: 43.2000, lon: 77.0500 },
  { name: "Kapchagay Reservoir East",   aqi:  30, lat: 43.8500, lon: 77.2000 },
  { name: "CryptoCity Hub",             aqi:  48, lat: 43.6800, lon: 77.1000 },
];

const DISTRICTS: DistrictData[] = [
  { name: "Gate District",    lat: 43.6743, lon: 77.1082, projects: 3, devScore: 88 },
  { name: "Golden District",  lat: 43.6900, lon: 77.1300, projects: 1, devScore: 45 },
  { name: "Growing District", lat: 43.7200, lon: 77.0300, projects: 2, devScore: 72 },
  { name: "Green District",   lat: 43.8300, lon: 77.0800, projects: 1, devScore: 55 },
  { name: "A3 Corridor",      lat: 43.4650, lon: 77.0200, projects: 1, devScore: 40 },
  { name: "Qonaev",           lat: 43.8642, lon: 77.0633, projects: 0, devScore: 28 },
];

const TRANSPORT_ARCS: ArcData[] = [
  { name: "Almaty → A3 Midpoint",       source: [76.9800, 43.3500], target: [77.0200, 43.4650] },
  { name: "A3 Midpoint → Gate District",source: [77.0200, 43.4650], target: [77.1082, 43.6743] },
  { name: "Gate → Light Rail North",    source: [77.1082, 43.6743], target: [77.0850, 43.7700] },
  { name: "Light Rail → Qonaev",        source: [77.0850, 43.7700], target: [77.0633, 43.8642] },
  { name: "Gate District → Airport",    source: [77.1082, 43.6743], target: [77.0500, 43.7100] },
];

// ── AI Suggestions ────────────────────────────────────────────────────────────

type Priority = "critical" | "high" | "medium";
type Impact   = "High" | "Medium" | "Low";

interface Suggestion {
  id: number;
  priority: Priority;
  category: string;
  title: string;
  description: string;
  action: string;
  impact: Impact;
  projects: string[];
}

const AI_SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    priority: "critical",
    category: "Environment",
    title: "Growing District AQI Critical",
    description: "AQI 135 detected at the Industrial Zone — 3× above safe threshold. Expedite green buffer zone planning between the Logistics Park and nearest residential areas. Temporary construction pauses during peak wind advisory days are strongly recommended.",
    action: "Initiate environmental impact review",
    impact: "High",
    projects: ["Logistics Park"],
  },
  {
    id: 2,
    priority: "high",
    category: "Infrastructure",
    title: "Transit Sequencing Misalignment",
    description: "A3 Highway at 55% vs Light Rail at only 5% completion. Opening the highway without a transit alternative will cause a congestion surge. Fast-track LRT Phase 1 or deploy temporary BRT on the A3 before full highway opening.",
    action: "Re-evaluate Q3 2025 milestone dependencies",
    impact: "High",
    projects: ["A3 Highway Expansion", "Alatau–Qonaev Light Rail"],
  },
  {
    id: 3,
    priority: "high",
    category: "Smart City",
    title: "Smart Traffic Near Completion — Sync Now",
    description: "Smart Traffic System at 83%. Syncing the final deployment with A3 Highway Phase 2 maximises adaptive routing value. Early activation could reduce construction-zone delays by ~30% even before full road opening.",
    action: "Schedule cross-team sync with highway contractors",
    impact: "Medium",
    projects: ["Smart Traffic System", "A3 Highway Expansion"],
  },
  {
    id: 4,
    priority: "medium",
    category: "Tourism",
    title: "Tourism Cluster Activation Window",
    description: "Kapchagay Resort at 68% and Eco-Trail at 15%. Launch pre-opening marketing 2 months before resort completion to prime demand. Eco-trail Phase 1 (40 km) can open independently this quarter for early revenue.",
    action: "Launch pre-opening marketing campaign",
    impact: "Medium",
    projects: ["Kapchagay Resort Complex", "Ile-Alatau Eco-Tourism Trail"],
  },
  {
    id: 5,
    priority: "medium",
    category: "Economy",
    title: "CryptoCity + University Talent Synergy",
    description: "CryptoCity Hub (41%) and Golden District University (22%) are 2.5 km apart. A joint internship framework and co-development MOU would create a natural talent pipeline for the blockchain and fintech sector.",
    action: "Draft co-development MOU",
    impact: "Medium",
    projects: ["CryptoCity Blockchain Hub", "Golden District University"],
  },
];

// ── Styles ────────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, [number, number, number, number]> = {
  infrastructure: [59,  130, 246, 220],
  commercial:     [245, 158,  11, 220],
  education:      [34,  197,  94, 220],
  tech:           [139,  92, 246, 220],
  tourism:        [20,  184, 166, 220],
  industrial:     [239,  68,  68, 220],
  residential:    [156, 163, 175, 220],
};

const TYPE_HEX: Record<string, string> = {
  infrastructure: "#3B82F6",
  commercial:     "#F59E0B",
  education:      "#22C55E",
  tech:           "#8B5CF6",
  tourism:        "#14B8A6",
  industrial:     "#EF4444",
  residential:    "#9CA3AF",
};

const TYPE_LABELS: Record<string, string> = {
  infrastructure: "Infrastructure",
  commercial:     "Commercial",
  education:      "Education",
  tech:           "Tech",
  tourism:        "Tourism",
  industrial:     "Industrial",
};

const DISTRICT_COLORS: Record<number, [number, number, number, number]> = {
  0: [59,  130, 246, 200],
  1: [99,  102, 241, 200],
  2: [139,  92, 246, 200],
};

function districtColor(score: number): [number, number, number, number] {
  if (score > 70) return DISTRICT_COLORS[0];
  if (score > 40) return DISTRICT_COLORS[1];
  return DISTRICT_COLORS[2];
}

const PRIORITY_CFG: Record<Priority, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: { label: "Critical", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500"    },
  high:     { label: "High",     bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  medium:   { label: "Medium",   bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
};

function aqiColor(aqi: number): string {
  if (aqi > 100) return "#EF4444";
  if (aqi > 50)  return "#F59E0B";
  return "#22C55E";
}

function aqiLabel(aqi: number): string {
  if (aqi > 150) return "Unhealthy";
  if (aqi > 100) return "Sensitive";
  if (aqi > 50)  return "Moderate";
  return "Good";
}

// ── Layer keys ────────────────────────────────────────────────────────────────

type LayerKey = "aqi" | "projects" | "districts" | "transport";

const LAYER_OPTS: { key: LayerKey; label: string; dot: string }[] = [
  { key: "aqi",       label: "AQI Heatmap",    dot: "bg-red-400"    },
  { key: "projects",  label: "Projects",        dot: "bg-blue-500"   },
  { key: "districts", label: "Dev. Index (3D)", dot: "bg-indigo-500" },
  { key: "transport", label: "Transport Links", dot: "bg-purple-500" },
];

interface TooltipData { x: number; y: number; text: string }

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalyticsClient() {
  const [activeLayers, setActiveLayers] = useState<Record<LayerKey, boolean>>({
    aqi:       true,
    projects:  true,
    districts: true,
    transport: true,
  });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [expanded, setExpanded] = useState<number | null>(1);

  const toggleLayer = useCallback((key: LayerKey) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // KPIs
  const totalProjects  = PROJECTS.length;
  const activeProjects = PROJECTS.filter(p => p.status === "active").length;
  const avgCompletion  = Math.round(PROJECTS.reduce((s, p) => s + p.completion, 0) / PROJECTS.length);
  const avgAqi         = Math.round(SENSORS.reduce((s, x) => s + x.aqi, 0) / SENSORS.length);
  const maxAqi         = Math.max(...SENSORS.map(s => s.aqi));
  const criticalCount  = AI_SUGGESTIONS.filter(s => s.priority === "critical" || s.priority === "high").length;

  // Layers
  const layers = [];

  if (activeLayers.aqi) {
    layers.push(
      new HeatmapLayer<SensorData>({
        id: "aqi-heatmap",
        data: SENSORS,
        getPosition: (d) => [d.lon, d.lat],
        getWeight: (d) => d.aqi / 500,
        radiusPixels: 90,
        intensity: 2,
        threshold: 0.05,
        colorRange: [
          [1,   152, 189],
          [73,  227, 206],
          [216, 254, 181],
          [254, 237, 177],
          [254, 173,  84],
          [209,  55,  78],
        ],
      })
    );
  }

  if (activeLayers.transport) {
    layers.push(
      new ArcLayer<ArcData>({
        id: "transport-arcs",
        data: TRANSPORT_ARCS,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getSourceColor: [59, 130, 246, 200],
        getTargetColor: [139, 92, 246, 200],
        getWidth: 3,
        pickable: true,
        onHover: ({ object, x, y }: { object?: ArcData; x: number; y: number }) => {
          setTooltip(object ? { x, y, text: `Transport: ${object.name}` } : null);
        },
      })
    );
  }

  if (activeLayers.districts) {
    layers.push(
      new ColumnLayer<DistrictData>({
        id: "district-columns",
        data: DISTRICTS,
        getPosition: (d) => [d.lon, d.lat],
        getElevation: (d) => d.devScore * 250,
        radius: 650,
        getFillColor: (d) => districtColor(d.devScore),
        extruded: true,
        pickable: true,
        onHover: ({ object, x, y }: { object?: DistrictData; x: number; y: number }) => {
          setTooltip(
            object
              ? { x, y, text: `${object.name}\nDev. Score: ${object.devScore}/100 · ${object.projects} project${object.projects !== 1 ? "s" : ""}` }
              : null
          );
        },
      })
    );
  }

  if (activeLayers.projects) {
    layers.push(
      new ScatterplotLayer<ProjectData>({
        id: "projects-scatter",
        data: PROJECTS,
        getPosition: (d) => [d.lon, d.lat],
        getRadius: (d) => 60 + d.completion * 0.8,
        getFillColor: (d) => TYPE_COLOR[d.type] ?? [156, 163, 175, 200],
        getLineColor: [255, 255, 255, 120],
        lineWidthMinPixels: 1.5,
        stroked: true,
        pickable: true,
        radiusMinPixels: 7,
        radiusMaxPixels: 24,
        onHover: ({ object, x, y }: { object?: ProjectData; x: number; y: number }) => {
          setTooltip(
            object
              ? { x, y, text: `${object.title}\n${TYPE_LABELS[object.type] ?? object.type} · ${object.completion}% complete` }
              : null
          );
        },
      })
    );
  }

  // Chart data
  const byType = Object.entries(
    PROJECTS.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 space-y-5 max-w-[1380px]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">City Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time intelligence dashboard · Alatau City development</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-gray-400">Last updated</p>
          <p className="font-semibold text-gray-700 mt-0.5">March 20, 2026</p>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-5 gap-4">
        {[
          {
            label: "Total Projects", value: totalProjects,
            sub: `${activeProjects} active`, accent: "#3B82F6", bg: "#EFF6FF",
          },
          {
            label: "Avg. Completion", value: `${avgCompletion}%`,
            sub: "across all projects", accent: "#8B5CF6", bg: "#F5F3FF",
          },
          {
            label: "Avg. City AQI", value: avgAqi,
            sub: "Good threshold < 50",
            accent: avgAqi > 100 ? "#EF4444" : avgAqi > 50 ? "#F59E0B" : "#22C55E",
            bg:     avgAqi > 100 ? "#FEF2F2" : avgAqi > 50 ? "#FFFBEB" : "#F0FDF4",
          },
          {
            label: "Peak AQI", value: maxAqi,
            sub: "Growing Industrial", accent: "#EF4444", bg: "#FEF2F2",
          },
          {
            label: "AI Suggestions", value: AI_SUGGESTIONS.length,
            sub: `${criticalCount} high-priority`, accent: "#F59E0B", bg: "#FFFBEB",
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.bg }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: stat.accent }} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            <p className="text-xs font-medium mt-1" style={{ color: stat.accent }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main: Map + AI ── */}
      <div className="grid grid-cols-[1fr_370px] gap-5">

        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Geospatial Overview</p>
              <p className="text-xs text-gray-400 mt-0.5">Deck.GL · hover to inspect</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LAYER_OPTS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => toggleLayer(opt.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    activeLayers[opt.key]
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeLayers[opt.key] ? "bg-white" : opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[490px]">
            <DeckGL
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={layers}
              getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
            >
              <Map mapStyle={MAP_STYLE} />
            </DeckGL>

            {tooltip && (
              <div
                className="absolute z-20 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg pointer-events-none"
                style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
              >
                {tooltip.text.split("\n").map((line, i) => (
                  <p key={i} className={i === 0 ? "text-gray-900 text-sm font-medium" : "text-gray-400 text-xs mt-0.5"}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2.5 shadow-md">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Project Types</p>
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_HEX[type] }} />
                  <span className="text-[10px] text-gray-600">{label}</span>
                </div>
              ))}
              <div className="mt-2 pt-1.5 border-t border-gray-100 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-blue-500 shrink-0" />
                  <span className="text-[10px] text-gray-600">Dev. Index (3D)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-purple-500 shrink-0" />
                  <span className="text-[10px] text-gray-600">Transport Arc</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0">
          <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">AI-Based Suggestions</p>
            </div>
            <p className="text-xs text-gray-400">Intelligent insights from city data patterns</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {AI_SUGGESTIONS.map(s => {
              const cfg = PRIORITY_CFG[s.priority];
              const isOpen = expanded === s.id;
              return (
                <div
                  key={s.id}
                  className={`rounded-xl border transition-all cursor-pointer select-none ${cfg.border} ${isOpen ? cfg.bg : "bg-white hover:bg-gray-50/60"}`}
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${cfg.text}`}>
                          {cfg.label} · {s.category}
                        </p>
                        <p className="text-xs font-semibold text-gray-900 leading-snug">{s.title}</p>
                      </div>
                      <svg
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>

                    {isOpen && (
                      <div className="mt-2.5 ml-3.5 space-y-2.5">
                        <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {s.projects.map(p => (
                            <span
                              key={p}
                              className="text-[10px] bg-white/80 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[10px] text-gray-400">
                            Impact: <span className="font-semibold text-gray-700">{s.impact}</span>
                          </span>
                          <button
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80 ${cfg.text} ${cfg.bg} ${cfg.border}`}
                            onClick={e => e.stopPropagation()}
                          >
                            {s.action}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Charts ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Projects by type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Projects by Type</p>
          <div className="space-y-3">
            {byType.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TYPE_HEX[type] }} />
                <span className="text-xs text-gray-600 w-28 shrink-0">{TYPE_LABELS[type] ?? type}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / totalProjects) * 100}%`, background: TYPE_HEX[type] }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 w-4 shrink-0 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AQI table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">AQI Sensor Readings</p>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {[...SENSORS].sort((a, b) => b.aqi - a.aqi).map(sensor => {
              const color = aqiColor(sensor.aqi);
              return (
                <div key={sensor.name} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shrink-0 tabular-nums"
                    style={{ background: color }}
                  >
                    {sensor.aqi}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{sensor.name}</p>
                    <p className="text-[10px] text-gray-400">{aqiLabel(sensor.aqi)}</p>
                  </div>
                  <div className="w-16 shrink-0">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min((sensor.aqi / 200) * 100, 100)}%`, background: color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Individual project progress ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">Individual Project Progress</p>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3">
          {[...PROJECTS].sort((a, b) => b.completion - a.completion).map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TYPE_HEX[p.type] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate pr-2">{p.title}</span>
                  <span className="text-xs font-bold shrink-0 tabular-nums" style={{ color: TYPE_HEX[p.type] }}>
                    {p.completion}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${p.completion}%`, background: TYPE_HEX[p.type] }}
                  />
                </div>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                  p.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
