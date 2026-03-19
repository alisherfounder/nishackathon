"use client";

import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, ArcLayer, LineLayer, HeatmapLayer } from "deck.gl";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW_STATE = {
  longitude: 77.05,
  latitude: 43.55,
  zoom: 9,
  pitch: 45,
  bearing: 0,
};

// Sample Central Asian cities
const CITIES = [
  { name: "Almaty", coordinates: [76.889709, 43.238949] as [number, number], population: 2000000 },
  { name: "Astana", coordinates: [71.446473, 51.180558] as [number, number], population: 1100000 },
  { name: "Shymkent", coordinates: [69.595177, 42.315423] as [number, number], population: 1000000 },
  { name: "Tashkent", coordinates: [69.279737, 41.299496] as [number, number], population: 2500000 },
  { name: "Bishkek", coordinates: [74.612663, 42.870093] as [number, number], population: 1000000 },
  { name: "Dushanbe", coordinates: [68.779716, 38.560119] as [number, number], population: 900000 },
  { name: "Ashgabat", coordinates: [58.380560, 37.960077] as [number, number], population: 800000 },
  { name: "Aktobe", coordinates: [57.166979, 50.279751] as [number, number], population: 500000 },
  { name: "Karaganda", coordinates: [73.109447, 49.806671] as [number, number], population: 480000 },
  { name: "Taraz", coordinates: [71.366071, 42.900438] as [number, number], population: 400000 },
];

// Generate arc connections from Almaty to other cities
const ARCS = CITIES.slice(1).map((city) => ({
  source: CITIES[0].coordinates,
  target: city.coordinates,
  sourceName: CITIES[0].name,
  targetName: city.name,
}));

// Generate heatmap points around cities
const HEATMAP_POINTS = CITIES.flatMap((city) =>
  Array.from({ length: 80 }, () => ({
    coordinates: [
      city.coordinates[0] + (Math.random() - 0.5) * 2,
      city.coordinates[1] + (Math.random() - 0.5) * 2,
    ] as [number, number],
    weight: Math.random(),
  }))
);

type LayerType = "scatter" | "arc" | "heatmap" | "line";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default function SandboxMap() {
  const [activeLayer, setActiveLayer] = useState<LayerType>("scatter");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const layers = {
    scatter: new ScatterplotLayer({
      id: "scatter",
      data: CITIES,
      getPosition: (d) => d.coordinates,
      getRadius: (d) => Math.sqrt(d.population) * 3,
      getFillColor: [99, 179, 237, 200],
      getLineColor: [147, 210, 255],
      lineWidthMinPixels: 1,
      stroked: true,
      pickable: true,
      onHover: ({ object, x, y }) => {
        if (object) {
          setTooltip({ x, y, text: `${object.name}\nPop: ${(object.population / 1000).toFixed(0)}K` });
        } else {
          setTooltip(null);
        }
      },
    }),
    arc: new ArcLayer({
      id: "arc",
      data: ARCS,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getSourceColor: [99, 179, 237],
      getTargetColor: [252, 129, 74],
      getWidth: 2,
      pickable: true,
      onHover: ({ object, x, y }) => {
        if (object) {
          setTooltip({ x, y, text: `${object.sourceName} → ${object.targetName}` });
        } else {
          setTooltip(null);
        }
      },
    }),
    heatmap: new HeatmapLayer({
      id: "heatmap",
      data: HEATMAP_POINTS,
      getPosition: (d) => d.coordinates,
      getWeight: (d) => d.weight,
      radiusPixels: 60,
      colorRange: [
        [1, 152, 189],
        [73, 227, 206],
        [216, 254, 181],
        [254, 237, 177],
        [254, 173, 84],
        [209, 55, 78],
      ],
    }),
    line: new LineLayer({
      id: "line",
      data: ARCS,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getColor: [99, 179, 237, 180],
      getWidth: 1.5,
      pickable: true,
      onHover: ({ object, x, y }) => {
        if (object) {
          setTooltip({ x, y, text: `${object.sourceName} → ${object.targetName}` });
        } else {
          setTooltip(null);
        }
      },
    }),
  };

  const LAYER_OPTIONS: { id: LayerType; label: string; description: string }[] = [
    { id: "scatter", label: "ScatterplotLayer", description: "City populations as scaled circles" },
    { id: "arc", label: "ArcLayer", description: "Connections from Almaty" },
    { id: "heatmap", label: "HeatmapLayer", description: "Population density heatmap" },
    { id: "line", label: "LineLayer", description: "Flat connection lines" },
  ];

  return (
    <div className="relative w-full h-screen bg-zinc-950">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-zinc-950/90 to-transparent pointer-events-none">
        <div>
          <h1 className="text-white text-xl font-semibold tracking-tight">deck.gl Sandbox</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Central Asia · Interactive Map Layers</p>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-2">
        {LAYER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => { setActiveLayer(opt.id); setTooltip(null); }}
            className={`px-4 py-2.5 rounded-lg text-left transition-all ${
              activeLayer === opt.id
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800/90 border border-zinc-700/50"
            }`}
          >
            <div className="text-sm font-medium">{opt.label}</div>
            <div className={`text-xs mt-0.5 ${activeLayer === opt.id ? "text-blue-100" : "text-zinc-500"}`}>
              {opt.description}
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-10 bg-zinc-900/90 border border-zinc-700/50 rounded-lg px-4 py-3">
        <p className="text-zinc-400 text-xs font-medium mb-2">DATA</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-zinc-300 text-xs">{CITIES.length} cities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-400" />
            <span className="text-zinc-300 text-xs">{ARCS.length} connections</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          {tooltip.text.split("\n").map((line, i) => (
            <p key={i} className={i === 0 ? "text-white text-sm font-medium" : "text-zinc-400 text-xs mt-0.5"}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* DeckGL Map */}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[layers[activeLayer]]}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
}
