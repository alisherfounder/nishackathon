import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { apiFetch } from "@/constants/api";

interface Project {
  id: string;
  title: string;
  institution: string;
  project_type: string;
  status: string;
  completion_pct: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  created_at: string;
}

const TYPE_COLOR: Record<string, string> = {
  infrastructure: "#3B82F6",
  commercial:     "#F59E0B",
  education:      "#22C55E",
  tech:           "#8B5CF6",
  tourism:        "#14B8A6",
  industrial:     "#EF4444",
  residential:    "#9CA3AF",
};

const NOTIF_COLOR: Record<string, string> = {
  DANGER: "#EF4444",
  JAM:    "#F59E0B",
  POLL:   "#3B82F6",
  INFO:   "#6B7280",
  ROAD:   "#F97316",
};

const NOTIF_ICON: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  DANGER: "warning",
  JAM:    "car",
  POLL:   "checkbox",
  INFO:   "information-circle",
  ROAD:   "construct",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [projs, notifs] = await Promise.allSettled([
        apiFetch<Project[]>("/projects"),
        apiFetch<Notification[]>("/notifications"),
      ]);
      if (projs.status === "fulfilled")   setProjects(projs.value);
      if (notifs.status === "fulfilled")  setNotifications(notifs.value.slice(0, 5));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const active    = projects.filter(p => p.status === "active").length;
  const planned   = projects.filter(p => p.status === "planned").length;
  const avgPct    = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.completion_pct, 0) / projects.length)
    : 0;

  const QUICK_ACTIONS = [
    { label: "Map",        icon: "map"           as const, route: "/(tabs)/map"           },
    { label: "Requests",   icon: "document-text" as const, route: "/(tabs)/requests"      },
    { label: "Alerts",     icon: "notifications" as const, route: "/(tabs)/notifications" },
    { label: "AI Chat",    icon: "sparkles"      as const, route: "/(tabs)/ai"            },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#1D4ED8", "#3B82F6"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerCity}>Alatau City</Text>
            <Text style={styles.headerSub}>Smart City Portal</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push("/(tabs)/ai")}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: "Total",     value: projects.length, icon: "layers"      as const },
            { label: "Active",    value: active,           icon: "flash"       as const },
            { label: "Planned",   value: planned,          icon: "time"        as const },
            { label: "Avg. Done", value: `${avgPct}%`,     icon: "trending-up" as const },
          ].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={() => router.push(action.route as never)}
              activeOpacity={0.7}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={action.icon} size={22} color="#3B82F6" />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent projects */}
        <Text style={styles.sectionTitle}>Recent Projects</Text>
        {loading ? (
          <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
        ) : projects.slice(0, 4).map(p => (
          <View key={p.id} style={styles.projectCard}>
            <View style={[styles.projectDot, { backgroundColor: TYPE_COLOR[p.project_type] ?? "#9CA3AF" }]} />
            <View style={styles.projectBody}>
              <Text style={styles.projectTitle} numberOfLines={1}>{p.title}</Text>
              <Text style={styles.projectInst}>{p.institution}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${p.completion_pct}%` as `${number}%`, backgroundColor: TYPE_COLOR[p.project_type] ?? "#3B82F6" },
                    ]}
                  />
                </View>
                <Text style={[styles.progressPct, { color: TYPE_COLOR[p.project_type] ?? "#3B82F6" }]}>
                  {p.completion_pct}%
                </Text>
              </View>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: p.status === "active" ? "#DCFCE7" : "#F3F4F6" },
            ]}>
              <Text style={[
                styles.statusText,
                { color: p.status === "active" ? "#16A34A" : "#6B7280" },
              ]}>
                {p.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Recent alerts */}
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
        {notifications.map(n => (
          <View key={n.id} style={styles.notifCard}>
            <View style={[styles.notifIcon, { backgroundColor: `${NOTIF_COLOR[n.type] ?? "#6B7280"}20` }]}>
              <Ionicons
                name={NOTIF_ICON[n.type] ?? "information-circle"}
                size={18}
                color={NOTIF_COLOR[n.type] ?? "#6B7280"}
              />
            </View>
            <View style={styles.notifBody}>
              <Text style={styles.notifTitle} numberOfLines={1}>{n.title}</Text>
              {n.body && <Text style={styles.notifDesc} numberOfLines={2}>{n.body}</Text>}
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#F9FAFB" },
  header:        { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  headerCity:    { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  headerSub:     { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  settingsBtn:   { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  statsRow:      { flexDirection: "row", gap: 10 },
  statCard:      { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  statValue:     { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel:     { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  scroll:        { flex: 1 },
  scrollContent: { padding: 20 },
  sectionTitle:  { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12, marginTop: 4 },
  quickGrid:     { flexDirection: "row", gap: 12, marginBottom: 24 },
  quickCard:     { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  quickIcon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  quickLabel:    { fontSize: 11, fontWeight: "600", color: "#374151", textAlign: "center" },
  projectCard:   { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, gap: 12 },
  projectDot:    { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  projectBody:   { flex: 1, gap: 3 },
  projectTitle:  { fontSize: 13, fontWeight: "600", color: "#111827" },
  projectInst:   { fontSize: 11, color: "#9CA3AF" },
  progressRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  progressBg:    { flex: 1, height: 4, backgroundColor: "#F3F4F6", borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 2 },
  progressPct:   { fontSize: 11, fontWeight: "700", minWidth: 28, textAlign: "right" },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText:    { fontSize: 10, fontWeight: "700" },
  notifCard:     { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#F3F4F6", gap: 12 },
  notifIcon:     { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  notifBody:     { flex: 1, gap: 3 },
  notifTitle:    { fontSize: 13, fontWeight: "600", color: "#111827" },
  notifDesc:     { fontSize: 12, color: "#6B7280", lineHeight: 18 },
});
