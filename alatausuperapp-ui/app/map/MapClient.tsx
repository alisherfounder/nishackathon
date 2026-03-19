"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, HeatmapLayer } from "deck.gl";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ConfirmDialog";

const API = "http://localhost:8000";
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 77.05,
  latitude: 43.55,
  zoom: 9.5,
  pitch: 45,
  bearing: -15,
};

interface Project {
  id: string;
  title: string;
  description?: string;
  institution: string;
  status: string;
  lat?: number;
  lon?: number;
}

interface Sensor {
  id: string;
  name?: string;
  aqi: number;
  pm25?: number;
  lat?: number;
  lon?: number;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  lat?: number;
  lon?: number;
}

const STATUS_FILL: Record<string, [number, number, number, number]> = {
  active: [106, 148, 245, 220],   // #6A94F5
  planned: [160, 196, 255, 200],  // #A0C4FF
  completed: [113, 113, 122, 160],
};

type LayerKey = "projects" | "aqi" | "traffic" | "danger";
type EventType = "project" | "JAM" | "DANGER";

interface TooltipData {
  x: number;
  y: number;
  text: string;
}

interface ClickedPoint {
  lat: number;
  lon: number;
}

const EVENT_OPTIONS: {
  value: EventType;
  label: string;
  color: string;
}[] = [
  { value: "project", label: "Project", color: "bg-brand-mid" },
  { value: "JAM", label: "Traffic Jam", color: "bg-amber-500" },
  { value: "DANGER", label: "Danger Zone", color: "bg-red-500" },
];

export default function MapClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [jams, setJams] = useState<NotificationItem[]>([]);
  const [dangers, setDangers] = useState<NotificationItem[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [activeLayers, setActiveLayers] = useState<Record<LayerKey, boolean>>({
    projects: true,
    aqi: true,
    traffic: true,
    danger: true,
  });

  const [clickedPoint, setClickedPoint] = useState<ClickedPoint | null>(null);
  const [eventType, setEventType] = useState<EventType>("project");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formInstitution, setFormInstitution] = useState("");
  const [formStatus, setFormStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [projRes, sensorRes, jamRes, dangerRes] = await Promise.allSettled([
      fetch(`${API}/projects`),
      fetch(`${API}/sensors`),
      fetch(`${API}/notifications?type=JAM`),
      fetch(`${API}/notifications?type=DANGER`),
    ]);
    if (projRes.status === "fulfilled" && projRes.value.ok)
      setProjects(await projRes.value.json());
    if (sensorRes.status === "fulfilled" && sensorRes.value.ok)
      setSensors(await sensorRes.value.json());
    if (jamRes.status === "fulfilled" && jamRes.value.ok)
      setJams(await jamRes.value.json());
    if (dangerRes.status === "fulfilled" && dangerRes.value.ok)
      setDangers(await dangerRes.value.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleLayer = useCallback((key: LayerKey) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleMapClick = useCallback(
    (info: { coordinate?: number[]; object?: unknown }) => {
      if (info.object) return;
      if (info.coordinate) {
        setClickedPoint({ lon: info.coordinate[0], lat: info.coordinate[1] });
        setFormTitle("");
        setFormDesc("");
        setFormInstitution("");
        setFormStatus("active");
        setEventType("project");
      }
    },
    []
  );

  const closeCreator = useCallback(() => {
    setClickedPoint(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!clickedPoint || !formTitle.trim()) return;
    setSubmitting(true);
    try {
      const label = EVENT_OPTIONS.find((o) => o.value === eventType)?.label ?? "Event";
      if (eventType === "project") {
        await fetch(`${API}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            description: formDesc || undefined,
            institution: formInstitution || "Alatau City Development",
            status: formStatus,
            lat: clickedPoint.lat,
            lon: clickedPoint.lon,
          }),
        });
      } else {
        await fetch(`${API}/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: eventType,
            title: formTitle,
            body: formDesc || undefined,
            lat: clickedPoint.lat,
            lon: clickedPoint.lon,
          }),
        });
      }
      setClickedPoint(null);
      toast(`${label} "${formTitle}" created`, "success");
      fetchData();
    } catch {
      toast("Failed to create event", "error");
    } finally {
      setSubmitting(false);
    }
  }, [clickedPoint, eventType, formTitle, formDesc, formInstitution, formStatus, fetchData, toast]);

  const handleDeleteProject = useCallback(
    async (obj: Project) => {
      const confirmed = await confirm({
        title: "Delete Project",
        message: `Delete "${obj.title}"? This action cannot be undone.`,
        confirmLabel: "Delete",
        variant: "danger",
      });
      if (!confirmed) return;
      await fetch(`${API}/projects/${obj.id}`, { method: "DELETE" });
      toast(`Project "${obj.title}" deleted`, "success");
      fetchData();
    },
    [fetchData, toast, confirm]
  );

  const handleDeleteNotification = useCallback(
    async (obj: NotificationItem, type: "traffic" | "danger") => {
      const confirmed = await confirm({
        title: type === "danger" ? "Delete Danger Alert" : "Delete Traffic Report",
        message: `Delete "${obj.title}"? This action cannot be undone.`,
        confirmLabel: "Delete",
        variant: type === "danger" ? "danger" : "warning",
      });
      if (!confirmed) return;
      await fetch(`${API}/notifications/${obj.id}`, { method: "DELETE" });
      toast(`${type === "danger" ? "Danger alert" : "Traffic report"} deleted`, "success");
      fetchData();
    },
    [fetchData, toast, confirm]
  );

  const geoProjects = projects.filter((p) => p.lat != null && p.lon != null);
  const geoSensors = sensors.filter((s) => s.lat != null && s.lon != null);
  const geoJams = jams.filter((j) => j.lat != null && j.lon != null);
  const geoDangers = dangers.filter((d) => d.lat != null && d.lon != null);

  const layers = [];

  if (activeLayers.aqi && geoSensors.length > 0) {
    layers.push(
      new HeatmapLayer({
        id: "aqi-heatmap",
        data: geoSensors,
        getPosition: (d: Sensor) => [d.lon!, d.lat!],
        getWeight: (d: Sensor) => d.aqi / 500,
        radiusPixels: 80,
        intensity: 1.5,
        threshold: 0.1,
        colorRange: [
          [1, 152, 189],
          [73, 227, 206],
          [216, 254, 181],
          [254, 237, 177],
          [254, 173, 84],
          [209, 55, 78],
        ],
      })
    );
  }

  if (activeLayers.projects && geoProjects.length > 0) {
    layers.push(
      new ScatterplotLayer({
        id: "projects-scatter",
        data: geoProjects,
        getPosition: (d: Project) => [d.lon!, d.lat!],
        getRadius: 60,
        getFillColor: (d: Project) => STATUS_FILL[d.status] ?? STATUS_FILL.completed,
        getLineColor: [255, 255, 255, 80],
        lineWidthMinPixels: 1,
        stroked: true,
        pickable: true,
        radiusMinPixels: 6,
        radiusMaxPixels: 20,
        onHover: ({ object, x, y }: { object?: Project; x: number; y: number }) => {
          setTooltip(object ? { x, y, text: `${object.title}\n${object.institution} \u00b7 ${object.status}` } : null);
        },
        onClick: ({ object }: { object?: Project }) => {
          if (object) handleDeleteProject(object);
        },
      })
    );
  }

  if (activeLayers.traffic && geoJams.length > 0) {
    layers.push(
      new ScatterplotLayer({
        id: "traffic-scatter",
        data: geoJams,
        getPosition: (d: NotificationItem) => [d.lon!, d.lat!],
        getRadius: 50,
        getFillColor: [245, 158, 11, 180] as [number, number, number, number],
        getLineColor: [245, 158, 11, 255] as [number, number, number, number],
        lineWidthMinPixels: 2,
        stroked: true,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 14,
        onHover: ({ object, x, y }: { object?: NotificationItem; x: number; y: number }) => {
          setTooltip(object ? { x, y, text: `Traffic: ${object.title}` } : null);
        },
        onClick: ({ object }: { object?: NotificationItem }) => {
          if (object) handleDeleteNotification(object, "traffic");
        },
      })
    );
  }

  if (activeLayers.danger && geoDangers.length > 0) {
    layers.push(
      new ScatterplotLayer({
        id: "danger-scatter",
        data: geoDangers,
        getPosition: (d: NotificationItem) => [d.lon!, d.lat!],
        getRadius: 70,
        getFillColor: [239, 68, 68, 180] as [number, number, number, number],
        getLineColor: [239, 68, 68, 255] as [number, number, number, number],
        lineWidthMinPixels: 2,
        stroked: true,
        pickable: true,
        radiusMinPixels: 7,
        radiusMaxPixels: 18,
        onHover: ({ object, x, y }: { object?: NotificationItem; x: number; y: number }) => {
          setTooltip(object ? { x, y, text: `Danger: ${object.title}` } : null);
        },
        onClick: ({ object }: { object?: NotificationItem }) => {
          if (object) handleDeleteNotification(object, "danger");
        },
      })
    );
  }

  if (clickedPoint) {
    const markerColor: Record<EventType, [number, number, number, number]> = {
      project: [15, 76, 117, 255],   // #0F4C75
      JAM: [245, 158, 11, 255],
      DANGER: [239, 68, 68, 255],
    };
    layers.push(
      new ScatterplotLayer({
        id: "clicked-marker",
        data: [clickedPoint],
        getPosition: (d: ClickedPoint) => [d.lon, d.lat],
        getRadius: 100,
        getFillColor: markerColor[eventType],
        getLineColor: [255, 255, 255, 200],
        lineWidthMinPixels: 2,
        stroked: true,
        radiusMinPixels: 10,
        radiusMaxPixels: 24,
      })
    );
  }

  const LAYER_OPTIONS: { key: LayerKey; label: string; color: string; count: number }[] = [
    { key: "projects", label: "Projects", color: "bg-brand-mid", count: geoProjects.length },
    { key: "aqi", label: "AQI Heatmap", color: "bg-blue-500", count: geoSensors.length },
    { key: "traffic", label: "Traffic Jams", color: "bg-amber-500", count: geoJams.length },
    { key: "danger", label: "Danger Zones", color: "bg-red-500", count: geoDangers.length },
  ];

  return (
    <div className="relative w-full h-screen bg-gray-50" style={{ marginLeft: "-15rem" }}>
      {/* Layer Controls */}
      <div className="absolute top-4 left-64 z-10 flex flex-col gap-2">
        {LAYER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => toggleLayer(opt.key)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-left transition-all shadow-lg ${
              activeLayers[opt.key]
                ? "bg-white text-gray-900 border border-gray-200"
                : "bg-white/70 text-gray-400 border border-gray-100"
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${activeLayers[opt.key] ? opt.color : "bg-gray-300"}`} />
            <span className="text-sm font-medium">{opt.label}</span>
            <span className="text-xs text-gray-400 ml-auto">{opt.count}</span>
          </button>
        ))}
      </div>

      {/* Hint */}
      {!clickedPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-5 py-2.5 shadow-lg">
          <p className="text-gray-600 text-sm">Click anywhere on the map to create an event</p>
        </div>
      )}

      {/* Creator Panel */}
      {clickedPoint && (
        <div
          ref={panelRef}
          className="absolute top-4 right-4 z-30 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">New Event</h3>
            <button
              onClick={closeCreator}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              x
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="flex gap-2 text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <span>{clickedPoint.lat.toFixed(5)}</span>
              <span className="text-gray-300">,</span>
              <span>{clickedPoint.lon.toFixed(5)}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEventType(opt.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-all border ${
                      eventType === opt.value
                        ? "bg-gray-50 text-gray-900 border-gray-300 shadow-sm"
                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${eventType === opt.value ? opt.color : "bg-gray-200"}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Title</label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={
                  eventType === "project"
                    ? "e.g. New Park Construction"
                    : eventType === "JAM"
                    ? "e.g. A3 Highway Congestion"
                    : "e.g. Gas Leak Alert"
                }
                className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-mid"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">
                {eventType === "project" ? "Description" : "Details"}
              </label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                placeholder="Optional details..."
                className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-mid resize-none"
              />
            </div>

            {eventType === "project" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-medium">Institution</label>
                  <input
                    value={formInstitution}
                    onChange={(e) => setFormInstitution(e.target.value)}
                    placeholder="e.g. Alatau City Development"
                    className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-mid"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-medium">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-mid"
                  >
                    <option value="active">Active</option>
                    <option value="planned">Planned</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </>
            )}

            <button
              onClick={handleCreate}
              disabled={submitting || !formTitle.trim()}
              className={`mt-1 w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 text-white ${
                eventType === "JAM"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : eventType === "DANGER"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }`}
              style={eventType === "project" ? { background: "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" } : undefined}
            >
              {submitting
                ? "Creating..."
                : `Create ${EVENT_OPTIONS.find((o) => o.value === eventType)?.label}`}
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-64 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-gray-500 text-xs font-medium mb-2">LEGEND</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-mid" />
            <span className="text-gray-600 text-xs">Active Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-light" />
            <span className="text-gray-600 text-xs">Planned Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600 text-xs">Traffic Jam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 text-xs">Danger Zone</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-gray-400 text-xs">Click feature to delete</p>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && !clickedPoint && (
        <div
          className="absolute z-20 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          {tooltip.text.split("\n").map((line, i) => (
            <p
              key={i}
              className={i === 0 ? "text-gray-900 text-sm font-medium" : "text-gray-400 text-xs mt-0.5"}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* DeckGL Map */}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onClick={handleMapClick}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "crosshair")}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
}
