import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch } from "@/constants/api";

interface Notification {
  id: string;
  type: "DANGER" | "JAM" | "POLL" | "INFO" | "ROAD";
  title: string;
  body?: string;
  lat?: number;
  lon?: number;
  created_at: string;
}

const TYPE_CFG: Record<
  Notification["type"],
  { label: string; bg: string; text: string; icon: React.ComponentProps<typeof Ionicons>["name"]; iconBg: string }
> = {
  DANGER: { label: "Danger",      bg: "#FEF2F2", text: "#DC2626", icon: "warning",           iconBg: "#FEE2E2" },
  JAM:    { label: "Traffic Jam", bg: "#FFFBEB", text: "#D97706", icon: "car",               iconBg: "#FEF3C7" },
  POLL:   { label: "Poll",        bg: "#EFF6FF", text: "#1D4ED8", icon: "checkbox",           iconBg: "#DBEAFE" },
  INFO:   { label: "Info",        bg: "#F9FAFB", text: "#374151", icon: "information-circle", iconBg: "#F3F4F6" },
  ROAD:   { label: "Road Work",   bg: "#FFF7ED", text: "#C2410C", icon: "construct",          iconBg: "#FFEDD5" },
};

const TYPE_FILTERS = [
  { key: "ALL",    label: "All"     },
  { key: "DANGER", label: "Danger"  },
  { key: "JAM",    label: "Traffic" },
  { key: "POLL",   label: "Polls"   },
  { key: "ROAD",   label: "Roads"   },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const load = async () => {
    try {
      const data = await apiFetch<Notification[]>("/notifications");
      setItems(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = typeFilter === "ALL"
    ? items
    : items.filter(n => n.type === typeFilter);

  const renderItem = ({ item }: { item: Notification }) => {
    const cfg = TYPE_CFG[item.type] ?? TYPE_CFG.INFO;
    return (
      <View style={[styles.card, { backgroundColor: cfg.bg }]}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
          <Ionicons name={cfg.icon} size={20} color={cfg.text} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          </View>
          {item.body && <Text style={styles.desc} numberOfLines={3}>{item.body}</Text>}
          <View style={[styles.typePill, { backgroundColor: cfg.iconBg }]}>
            <Text style={[styles.typeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  const dangerCount = items.filter(n => n.type === "DANGER").length;
  const jamCount    = items.filter(n => n.type === "JAM").length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>City Alerts</Text>
          <Text style={styles.headerSub}>{items.length} total · {dangerCount} danger · {jamCount} traffic</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Summary badges */}
      {dangerCount > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={16} color="#DC2626" />
          <Text style={styles.alertBannerText}>
            {dangerCount} active danger alert{dangerCount > 1 ? "s" : ""} in the city
          </Text>
        </View>
      )}

      {/* Type filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {TYPE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, typeFilter === f.key && styles.filterActive]}
            onPress={() => setTypeFilter(f.key)}
          >
            <Text style={[styles.filterLabel, typeFilter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle" size={44} color="#86EFAC" />
              <Text style={styles.emptyTitle}>All clear</Text>
              <Text style={styles.emptySub}>No alerts in this category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: "#F9FAFB" },
  header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle:      { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub:        { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  refreshBtn:       { width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: "#EFF6FF", borderRadius: 12 },
  alertBanner:      { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FECACA" },
  alertBannerText:  { fontSize: 13, fontWeight: "600", color: "#DC2626" },
  filtersScroll:    { maxHeight: 50, backgroundColor: "#fff" },
  filtersContent:   { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip:       { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  filterActive:     { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  filterLabel:      { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterLabelActive:{ color: "#3B82F6" },
  list:             { padding: 16, gap: 10 },
  card:             { flexDirection: "row", borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  iconWrap:         { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  body:             { flex: 1, gap: 5 },
  titleRow:         { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  title:            { flex: 1, fontSize: 14, fontWeight: "700", color: "#111827", lineHeight: 20 },
  time:             { fontSize: 11, color: "#9CA3AF", flexShrink: 0, marginTop: 2 },
  desc:             { fontSize: 13, color: "#4B5563", lineHeight: 19 },
  typePill:         { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText:         { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  empty:            { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 8 },
  emptyTitle:       { fontSize: 16, fontWeight: "700", color: "#374151" },
  emptySub:         { fontSize: 13, color: "#9CA3AF" },
});
