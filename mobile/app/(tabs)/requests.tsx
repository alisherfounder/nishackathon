import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch, API_BASE } from "@/constants/api";

interface Request {
  id: string;
  requester_type: "individual" | "business";
  identifier: string;
  request_type: string;
  description: string;
  address: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "changes_requested";
  created_at: string;
}

const STATUS_CFG: Record<Request["status"], { label: string; bg: string; text: string }> = {
  pending:            { label: "Pending",          bg: "#FEF9C3", text: "#A16207" },
  under_review:       { label: "Under Review",     bg: "#DBEAFE", text: "#1D4ED8" },
  approved:           { label: "Approved",         bg: "#DCFCE7", text: "#16A34A" },
  rejected:           { label: "Rejected",         bg: "#FEE2E2", text: "#DC2626" },
  changes_requested:  { label: "Changes Needed",   bg: "#FEF3C7", text: "#D97706" },
};

const TYPE_LABELS: Record<string, string> = {
  apartment_building:  "Apartment Building",
  non_commercial_building: "Private House",
  shopping_center:     "Shopping Center",
  document_retrieval:  "Document Retrieval",
  hotel:               "Hotel",
  fence_garage_permit: "Fence / Garage",
  restaurant_cafe:     "Restaurant / Café",
  utility_connection:  "Utility Connection",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all",         label: "All"          },
  { key: "pending",     label: "Pending"      },
  { key: "under_review",label: "In Review"    },
  { key: "approved",    label: "Approved"     },
  { key: "rejected",    label: "Rejected"     },
];

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New request form state
  const [form, setForm] = useState({
    requester_type: "individual" as "individual" | "business",
    identifier: "",
    request_type: "document_retrieval",
    address: "",
    description: "",
  });

  const load = async () => {
    try {
      const data = await apiFetch<Request[]>("/requests");
      setRequests(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const handleSubmit = async () => {
    if (!form.identifier || !form.address || !form.description) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      setForm({ requester_type: "individual", identifier: "", request_type: "document_retrieval", address: "", description: "" });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Request }) => {
    const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeRow}>
            <Ionicons name="document-text" size={14} color="#6B7280" />
            <Text style={styles.typeLabel}>{TYPE_LABELS[item.request_type] ?? item.request_type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.requesterTag, item.requester_type === "business" && styles.requesterBiz]}>
            <Text style={[styles.requesterText, item.requester_type === "business" && styles.requesterBizText]}>
              {item.requester_type === "business" ? "Business" : "Individual"}
            </Text>
          </View>
          <Text style={styles.cardId}>{item.identifier}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Requests</Text>
          <Text style={styles.headerSub}>{requests.length} total · {requests.filter(r => r.status === "pending").length} pending</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
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
              <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No requests</Text>
            </View>
          }
        />
      )}

      {/* New request modal */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Request</Text>
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
            {/* Requester type toggle */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Requester Type</Text>
              <View style={styles.typeToggle}>
                {(["individual", "business"] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, form.requester_type === t && styles.typeBtnActive]}
                    onPress={() => setForm(f => ({ ...f, requester_type: t }))}
                  >
                    <Text style={[styles.typeBtnText, form.requester_type === t && styles.typeBtnActiveText]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{form.requester_type === "business" ? "BIN (12 digits)" : "IIN (12 digits)"}</Text>
              <TextInput
                style={styles.input}
                value={form.identifier}
                onChangeText={v => setForm(f => ({ ...f, identifier: v }))}
                placeholder="e.g. 920814350178"
                keyboardType="numeric"
                maxLength={12}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                placeholder="Street, district, city"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                placeholder="Describe your request in detail…"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!form.identifier || !form.address || !form.description) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting || !form.identifier || !form.address || !form.description}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Submit Request</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: "#F9FAFB" },
  header:             { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle:        { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub:          { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  newBtn:             { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#3B82F6", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  newBtnText:         { color: "#fff", fontSize: 14, fontWeight: "700" },
  filtersScroll:      { maxHeight: 50, backgroundColor: "#fff" },
  filtersContent:     { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip:         { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  filterChipActive:   { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  filterLabel:        { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterLabelActive:  { color: "#3B82F6" },
  list:               { padding: 16, gap: 10 },
  card:               { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#F3F4F6", gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardHeader:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeRow:            { flexDirection: "row", alignItems: "center", gap: 5 },
  typeLabel:          { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  badge:              { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:          { fontSize: 11, fontWeight: "700" },
  cardAddress:        { fontSize: 13, fontWeight: "600", color: "#111827" },
  cardDesc:           { fontSize: 12, color: "#6B7280", lineHeight: 18 },
  cardFooter:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  requesterTag:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "#F3F4F6" },
  requesterBiz:       { backgroundColor: "#EDE9FE" },
  requesterText:      { fontSize: 10, fontWeight: "700", color: "#6B7280" },
  requesterBizText:   { color: "#7C3AED" },
  cardId:             { fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" as const },
  empty:              { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyText:          { fontSize: 14, color: "#9CA3AF" },
  modal:              { flex: 1, backgroundColor: "#fff" },
  modalHeader:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalTitle:         { fontSize: 18, fontWeight: "800", color: "#111827" },
  modalBody:          { flex: 1, padding: 20 },
  fieldGroup:         { gap: 6 },
  fieldLabel:         { fontSize: 13, fontWeight: "600", color: "#374151" },
  input:              { backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111827" },
  textarea:           { height: 100, paddingTop: 12 },
  typeToggle:         { flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 4, gap: 4 },
  typeBtn:            { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  typeBtnActive:      { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  typeBtnText:        { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  typeBtnActiveText:  { color: "#111827" },
  submitBtn:          { backgroundColor: "#3B82F6", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitBtnDisabled:  { opacity: 0.45 },
  submitBtnText:      { color: "#fff", fontSize: 15, fontWeight: "700" },
});
