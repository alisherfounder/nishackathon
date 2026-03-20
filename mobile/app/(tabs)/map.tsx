import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Hardcoded city data (mirrors backend seed) ─────────────────────────────────

interface MapProject {
  id: string;
  title: string;
  type: string;
  status: string;
  completion: number;
  lat: number;
  lon: number;
  institution: string;
}

interface DangerZone {
  id: string;
  title: string;
  body: string;
  lat: number;
  lon: number;
  type: "DANGER" | "JAM";
}

const PROJECTS: MapProject[] = [
  { id: "1",  title: "SOM Landmark Tower",          type: "commercial",     status: "planned", completion: 12, lat: 43.6743, lon: 77.1082, institution: "Alatau City Development" },
  { id: "2",  title: "A3 Highway Expansion",         type: "infrastructure", status: "active",  completion: 55, lat: 43.4650, lon: 77.0200, institution: "Almaty Region Akimat" },
  { id: "3",  title: "Alatau International Airport", type: "infrastructure", status: "planned", completion:  8, lat: 43.7100, lon: 77.0500, institution: "Alatau City Development" },
  { id: "4",  title: "Golden District University",   type: "education",      status: "planned", completion: 22, lat: 43.6900, lon: 77.1300, institution: "Alatau City Development" },
  { id: "5",  title: "Kapchagay Resort Complex",     type: "tourism",        status: "active",  completion: 68, lat: 43.8300, lon: 77.0800, institution: "Qonaev City Akimat" },
  { id: "6",  title: "Smart Traffic System",         type: "tech",           status: "active",  completion: 83, lat: 43.6750, lon: 77.1150, institution: "Alatau City Development" },
  { id: "7",  title: "Alatau–Qonaev Light Rail",     type: "infrastructure", status: "planned", completion:  5, lat: 43.7700, lon: 77.0850, institution: "Almaty Region Akimat" },
  { id: "8",  title: "CryptoCity Blockchain Hub",    type: "tech",           status: "active",  completion: 41, lat: 43.6800, lon: 77.1000, institution: "Alatau City Development" },
  { id: "9",  title: "Ile-Alatau Eco-Tourism Trail", type: "tourism",        status: "planned", completion: 15, lat: 43.4000, lon: 77.0500, institution: "Almaty Region Akimat" },
  { id: "10", title: "Growing District Logistics",   type: "industrial",     status: "active",  completion: 60, lat: 43.7200, lon: 77.0300, institution: "Alatau City Development" },
];

const DANGER_ZONES: DangerZone[] = [
  { id: "d1", title: "Construction Hazard — A3",   body: "Heavy machinery active on A3 km 38–42. Lane closures in effect.",   lat: 43.6500, lon: 77.0900, type: "DANGER" },
  { id: "d2", title: "Traffic Congestion — A3",    body: "Heavy traffic at Almaty city limits. Expect 25-min delays.",         lat: 43.3500, lon: 76.9800, type: "JAM"    },
  { id: "d3", title: "Dust Storm — Growing Dist.", body: "PM2.5 elevated near industrial zone. Masks recommended outdoors.",   lat: 43.7200, lon: 77.0300, type: "DANGER" },
  { id: "d4", title: "Qonaev Bridge Congestion",   body: "Weekend buildup on Ili River bridge. Use eastern bypass.",           lat: 43.8550, lon: 77.0650, type: "JAM"    },
];

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

type LayerKey = "projects" | "danger" | "traffic";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    projects: true,
    danger:   true,
    traffic:  true,
  });
  const [selected, setSelected] = useState<MapProject | DangerZone | null>(null);

  const toggle = (key: LayerKey) =>
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const dangers = DANGER_ZONES.filter(d => d.type === "DANGER");
  const jams    = DANGER_ZONES.filter(d => d.type === "JAM");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>City Map</Text>
        <Text style={styles.headerSub}>Alatau Region — Interactive Overlay</Text>
      </View>

      {/* Layer toggles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.togglesScroll} contentContainerStyle={styles.togglesContent}>
        {([
          { key: "projects", label: "Projects",    color: "#3B82F6" },
          { key: "danger",   label: "Danger Zones",color: "#EF4444" },
          { key: "traffic",  label: "Traffic Jams", color: "#F59E0B" },
        ] as { key: LayerKey; label: string; color: string }[]).map(l => (
          <TouchableOpacity
            key={l.key}
            style={[styles.toggleChip, layers[l.key] && { backgroundColor: l.color, borderColor: l.color }]}
            onPress={() => toggle(l.key)}
          >
            <View style={[styles.toggleDot, { backgroundColor: layers[l.key] ? "#fff" : l.color }]} />
            <Text style={[styles.toggleLabel, layers[l.key] && { color: "#fff" }]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude:      43.62,
          longitude:     77.07,
          latitudeDelta:  0.65,
          longitudeDelta: 0.65,
        }}
        showsUserLocation
        showsMyLocationButton={Platform.OS === "android"}
      >
        {/* Project markers */}
        {layers.projects && PROJECTS.map(p => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lon }}
            onPress={() => setSelected(p)}
            pinColor={TYPE_HEX[p.type] ?? "#3B82F6"}
          />
        ))}

        {/* Danger circles */}
        {layers.danger && dangers.map(d => (
          <Circle
            key={d.id}
            center={{ latitude: d.lat, longitude: d.lon }}
            radius={1200}
            fillColor="rgba(239,68,68,0.15)"
            strokeColor="#EF4444"
            strokeWidth={2}
          />
        ))}

        {/* Traffic jam circles */}
        {layers.traffic && jams.map(j => (
          <Circle
            key={j.id}
            center={{ latitude: j.lat, longitude: j.lon }}
            radius={1000}
            fillColor="rgba(245,158,11,0.15)"
            strokeColor="#F59E0B"
            strokeWidth={2}
          />
        ))}
      </MapView>

      {/* Detail modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            {selected && "completion" in selected ? (
              // Project detail
              <>
                <View style={styles.modalTypeRow}>
                  <View style={[styles.modalTypeDot, { backgroundColor: TYPE_HEX[(selected as MapProject).type] }]} />
                  <Text style={styles.modalTypeLabel}>{TYPE_LABELS[(selected as MapProject).type]}</Text>
                </View>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalSub}>{(selected as MapProject).institution}</Text>
                <View style={styles.modalProgressRow}>
                  <View style={styles.modalProgressBg}>
                    <View style={[styles.modalProgressFill, {
                      width: `${(selected as MapProject).completion}%` as `${number}%`,
                      backgroundColor: TYPE_HEX[(selected as MapProject).type],
                    }]} />
                  </View>
                  <Text style={[styles.modalPct, { color: TYPE_HEX[(selected as MapProject).type] }]}>
                    {(selected as MapProject).completion}%
                  </Text>
                </View>
                <View style={[styles.statusPill,
                  (selected as MapProject).status === "active" ? styles.statusActive : styles.statusPlanned
                ]}>
                  <Text style={[styles.statusPillText,
                    (selected as MapProject).status === "active" ? styles.statusActiveText : styles.statusPlannedText
                  ]}>
                    {(selected as MapProject).status.toUpperCase()}
                  </Text>
                </View>
              </>
            ) : selected ? (
              // Danger/JAM detail
              <>
                <View style={[styles.dangerBanner,
                  (selected as DangerZone).type === "DANGER" ? styles.dangerRed : styles.dangerAmber
                ]}>
                  <Ionicons
                    name={(selected as DangerZone).type === "DANGER" ? "warning" : "car"}
                    size={20}
                    color={(selected as DangerZone).type === "DANGER" ? "#EF4444" : "#F59E0B"}
                  />
                  <Text style={[(selected as DangerZone).type === "DANGER" ? styles.dangerRedText : styles.dangerAmberText]}>
                    {(selected as DangerZone).type === "DANGER" ? "Danger Zone" : "Traffic Jam"}
                  </Text>
                </View>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalDesc}>{(selected as DangerZone).body}</Text>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: "#F9FAFB" },
  header:             { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle:        { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub:          { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  togglesScroll:      { backgroundColor: "#fff", maxHeight: 52 },
  togglesContent:     { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: "row" },
  toggleChip:         { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  toggleDot:          { width: 8, height: 8, borderRadius: 4 },
  toggleLabel:        { fontSize: 12, fontWeight: "600", color: "#374151" },
  map:                { flex: 1 },
  modalBackdrop:      { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalSheet:         { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, gap: 10 },
  modalHandle:        { width: 36, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  modalTypeRow:       { flexDirection: "row", alignItems: "center", gap: 6 },
  modalTypeDot:       { width: 10, height: 10, borderRadius: 5 },
  modalTypeLabel:     { fontSize: 12, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 },
  modalTitle:         { fontSize: 18, fontWeight: "800", color: "#111827", lineHeight: 26 },
  modalSub:           { fontSize: 13, color: "#6B7280" },
  modalDesc:          { fontSize: 14, color: "#4B5563", lineHeight: 22 },
  modalProgressRow:   { flexDirection: "row", alignItems: "center", gap: 10 },
  modalProgressBg:    { flex: 1, height: 6, backgroundColor: "#F3F4F6", borderRadius: 3, overflow: "hidden" },
  modalProgressFill:  { height: "100%", borderRadius: 3 },
  modalPct:           { fontSize: 14, fontWeight: "800", minWidth: 36, textAlign: "right" },
  statusPill:         { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusActive:       { backgroundColor: "#DCFCE7" },
  statusPlanned:      { backgroundColor: "#F3F4F6" },
  statusPillText:     { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  statusActiveText:   { color: "#16A34A" },
  statusPlannedText:  { color: "#6B7280" },
  dangerBanner:       { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  dangerRed:          { backgroundColor: "#FEF2F2" },
  dangerAmber:        { backgroundColor: "#FFFBEB" },
  dangerRedText:      { fontSize: 13, fontWeight: "700", color: "#EF4444" },
  dangerAmberText:    { fontSize: 13, fontWeight: "700", color: "#F59E0B" },
});
