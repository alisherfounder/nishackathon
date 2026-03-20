import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
}

// Hardcoded knowledge base for the city AI assistant
const KB: Record<string, string> = {
  aqi: `**Air Quality in Alatau City** (March 2026)\n\nCurrent status:\n• Growing District Industrial — AQI 135 (Sensitive)\n• Alatau Airport Zone — AQI 110 (Sensitive)\n• A3 Highway — AQI 88–95 (Moderate)\n• Gate District — AQI 45–52 (Good)\n• Green District Lakeside — AQI 28 (Good)\n\nThe worst air quality is in the industrial zone. Residents nearby are advised to reduce outdoor activity on construction-heavy days.`,

  projects: `**Active City Projects** (2026)\n\n1. Smart Traffic System — 83% complete (Tech)\n2. Kapchagay Resort Complex — 68% complete (Tourism)\n3. Growing District Logistics Park — 60% complete (Industrial)\n4. A3 Highway Expansion — 55% complete (Infrastructure)\n5. CryptoCity Blockchain Hub — 41% complete (Tech)\n\nPlanned: SOM Tower, Airport, University, Light Rail, Eco-Trail.`,

  transport: `**Transport in Alatau City**\n\nCurrent infrastructure:\n• A3 Highway expansion at 55% — widening from 4 to 8 lanes\n• Smart Traffic system at 83% across 120 intersections\n\nUpcoming:\n• Alatau–Qonaev Light Rail (15 km, 8 stops) — only 5% complete, planned for 2029\n• AI Suggestion: Transit sequencing risk — highway may open before rail is ready, causing congestion.`,

  crypticity: `**CryptoCity Blockchain Hub**\n\nA free economic zone in the Gate District for blockchain, fintech, and Web3 companies. Currently 41% complete (target: 2026).\n\nFeatures: Visa-free access zone, dedicated data center, co-working spaces.\n\nAI Insight: Located 2.5 km from Golden District University — potential for a talent pipeline partnership.`,

  poll: `**Active City Polls**\n\n1. Public transit priority — Light Rail leads (203 votes for subway extension)\n2. CryptoCity visa-free zone — 312 support fully\n3. Almaty Metro extension to Alatau — 445 say it's top priority\n4. Gate District pedestrian zone — mixed responses\n\nVoting is open in the Government Portal.`,

  danger: `**Current Safety Alerts**\n\n🔴 Construction hazard on A3 near Zhetygen (km 38-42)\n🟡 Traffic congestion at Almaty exit — 25 min delays\n🔴 Dust storm warning in Growing District — elevated PM2.5\n🟡 Qonaev bridge weekend congestion\n\nCheck the Alerts tab for real-time updates.`,

  airport: `**Alatau International Airport**\n\nPlanned capacity: 40 million passengers/year\nStatus: 8% complete (start: 2025, target: 2030)\nLocation: Northern zone, Growing District\n\nThis will be a major gateway for the new city, with integrated rail connections planned.`,

  university: `**Golden District University Campus**\n\n• 15,000 student capacity\n• Science labs, medical cluster, student housing\n• Status: 22% complete (target: 2028)\n\nAI Insight: Close proximity to CryptoCity Hub creates opportunity for a joint internship program in blockchain/fintech.`,
};

function findResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("aqi") || q.includes("air") || q.includes("pollution") || q.includes("smog")) return KB.aqi;
  if (q.includes("project") || q.includes("construction") || q.includes("building")) return KB.projects;
  if (q.includes("transport") || q.includes("highway") || q.includes("rail") || q.includes("bus") || q.includes("traffic")) return KB.transport;
  if (q.includes("crypto") || q.includes("blockchain") || q.includes("fintech") || q.includes("web3")) return KB.crypticity;
  if (q.includes("poll") || q.includes("vote") || q.includes("survey")) return KB.poll;
  if (q.includes("danger") || q.includes("alert") || q.includes("hazard") || q.includes("safe")) return KB.danger;
  if (q.includes("airport") || q.includes("flight") || q.includes("aviation")) return KB.airport;
  if (q.includes("university") || q.includes("education") || q.includes("campus") || q.includes("student")) return KB.university;

  return `I'm the Alatau City AI Assistant. I can help you with:\n\n• **Air quality** — current AQI readings\n• **Projects** — status of city development\n• **Transport** — highways, rail, traffic\n• **CryptoCity** — blockchain hub details\n• **Polls** — active citizen surveys\n• **Alerts** — safety & hazard info\n• **Airport** — international airport plans\n• **University** — Golden District campus\n\nJust ask about any of these topics!`;
}

const QUICK_QUESTIONS = [
  "What's the air quality today?",
  "Show me active projects",
  "Transport updates",
  "Safety alerts",
];

let msgId = 0;
const mkId = () => String(++msgId);

const INITIAL_MESSAGES: Message[] = [
  {
    id: mkId(),
    role: "assistant",
    text: "Hi! I'm the **Alatau City AI Assistant**. Ask me about air quality, city projects, transport, alerts, or anything about the city.",
    ts: Date.now(),
  },
];

export default function AiScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = (text: string = input.trim()) => {
    if (!text) return;
    setInput("");

    const userMsg: Message = { id: mkId(), role: "user", text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate response delay
    setTimeout(() => {
      const reply = findResponse(text);
      setMessages(prev => [...prev, { id: mkId(), role: "assistant", text: reply, ts: Date.now() }]);
      setTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 700 + Math.random() * 400);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    // Simple markdown-like bold rendering
    const parts = item.text.split(/\*\*(.+?)\*\*/g);

    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <LinearGradient colors={["#7C3AED", "#3B82F6"]} style={styles.avatar}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={isUser ? styles.bubbleUserText : styles.bubbleBotText}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <Text key={i} style={{ fontWeight: "800" }}>{part}</Text>
              ) : (
                part
              )
            )}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={22} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>City AI Assistant</Text>
          <Text style={styles.headerSub}>Powered by Alatau City data</Text>
        </View>
        <View style={styles.onlineDot} />
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          typing ? (
            <View style={[styles.msgRow]}>
              <LinearGradient colors={["#7C3AED", "#3B82F6"]} style={styles.avatar}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </LinearGradient>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#7C3AED" />
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick questions */}
      <View style={styles.quickRow}>
        {QUICK_QUESTIONS.map(q => (
          <TouchableOpacity key={q} style={styles.quickChip} onPress={() => send(q)}>
            <Text style={styles.quickChipText} numberOfLines={1}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about the city…"
          placeholderTextColor="#9CA3AF"
          returnKeyType="send"
          onSubmitEditing={() => send()}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || typing}
        >
          <LinearGradient
            colors={input.trim() ? ["#4F46E5", "#7C3AED"] : ["#E5E7EB", "#E5E7EB"]}
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={18} color={input.trim() ? "#fff" : "#9CA3AF"} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: "#F9FAFB" },
  header:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerIcon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle:    { fontSize: 16, fontWeight: "800", color: "#fff" },
  headerSub:      { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  onlineDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80", marginLeft: "auto" },
  messageList:    { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow:         { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  msgRowUser:     { justifyContent: "flex-end" },
  avatar:         { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble:         { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser:     { backgroundColor: "#4F46E5", borderBottomRightRadius: 4 },
  bubbleBot:      { backgroundColor: "#fff", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleUserText: { color: "#fff", fontSize: 14, lineHeight: 21 },
  bubbleBotText:  { color: "#111827", fontSize: 14, lineHeight: 21 },
  typingBubble:   { paddingHorizontal: 16, paddingVertical: 12 },
  quickRow:       { paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", flexWrap: "wrap", gap: 6, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  quickChip:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
  quickChipText:  { fontSize: 12, fontWeight: "600", color: "#1D4ED8" },
  inputBar:       { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 10, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  input:          { flex: 1, backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#111827", maxHeight: 100 },
  sendBtn:        { marginBottom: 2 },
  sendBtnDisabled:{},
  sendGradient:   { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
