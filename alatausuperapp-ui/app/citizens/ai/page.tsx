"use client";

import { useState, useRef, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What roads are under construction near me?",
  "Which projects are planned for 2025?",
  "What is the current air quality in Alatau?",
  "Are there any danger alerts active?",
];

function BotIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M12 11V7" /><circle cx="12" cy="5" r="2" /><path d="M8 15h.01M16 15h.01" /></svg>;
}

function SendIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
}

export default function CitizensAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(prompt: string) {
    if (!prompt.trim() || loading) return;
    const userMsg: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response ?? data.message ?? JSON.stringify(data) }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request. The AI service may be unavailable." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please check that the backend is running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
            <BotIcon />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">City AI Assistant</p>
            <p className="text-xs text-gray-400">Ask anything about Alatau City</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
              <BotIcon />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900 mb-1">How can I help?</p>
              <p className="text-sm text-gray-400">Ask about city projects, air quality, or alerts.</p>
            </div>
            <div className="w-full flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 text-left hover:bg-gray-50 hover:border-teal-300 transition-colors shadow-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white mr-2 mt-0.5" style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
                <BotIcon />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-blue-500 text-white rounded-br-md" : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white mr-2" style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}>
              <BotIcon />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
            placeholder="Ask about city projects, alerts..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
