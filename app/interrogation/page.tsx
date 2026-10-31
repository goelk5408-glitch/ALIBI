"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingSpinner from "../../components/LoadingSpinner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Briefing = {
  setting: string;
  victim: { name: string; description: string };
  timeOfDeath: string;
  suspects: { id: string; name: string; role: string; publicDescription: string }[];
};

export default function InterrogationPage() {
  const router = useRouter();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load briefing from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("briefing");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Briefing;
          setBriefing(parsed);
        } catch {
          console.error("Failed to parse briefing");
        }
      }
    }
  }, []);

  // Auto‑scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Increment question count after each user message
  const incrementQuestionCount = () => {
    if (typeof window !== 'undefined') {
      const count = Number(sessionStorage.getItem('questionCount') ?? '0') + 1;
      sessionStorage.setItem('questionCount', String(count));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedSuspectId) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setChatHistory((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          suspectId: selectedSuspectId,
          message: userMsg.content,
          chatHistory: [...chatHistory, userMsg],
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Interrogate failed");
      }
      const data = await res.json();
      const assistantMsg: Message = { role: "assistant", content: data.reply ?? "" };
      setChatHistory((prev) => [...prev, assistantMsg]);
      incrementQuestionCount();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to get a response. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!briefing) {
    return (
      <div className="flex items-center justify-center h-screen text-green-500 font-mono bg-black">
        <p>Loading briefing…</p>
      </div>
    );
  }

  if (!selectedSuspectId) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-green-500 font-mono bg-black min-h-screen">
        {error && <ErrorBanner message={error} />}
        <h2 className="text-2xl font-mono mb-4">Select a suspect to interrogate</h2>
        <ul className="list-none space-y-2">
          {briefing.suspects.map((s) => (
            <li
              key={s.id}
              className="p-2 border border-green-600 rounded cursor-pointer hover:bg-black/30"
              onClick={() => setSelectedSuspectId(s.id)}
            >
              <span className="font-bold text-green-500">{s.name}</span> – {s.role}<br />
              <span className="italic">{s.publicDescription}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => router.push("/briefing")}
          className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-600 rounded"
        >
          Back to Briefing
        </button>
      </div>
    );
  }

  const suspect = briefing.suspects.find((s) => s.id === selectedSuspectId);

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-mono">
      <header className="p-4 border-b border-green-600 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Interrogating: {suspect?.name} ({suspect?.role})</h2>
          <button
            onClick={() => setSelectedSuspectId(null)}
            className="text-xs text-green-400 underline hover:text-green-300 mt-1"
          >
            ← Switch Suspect
          </button>
        </div>
        <button
          onClick={() => router.push("/accusation")}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded shadow transition text-sm animate-pulse"
        >
          🚨 MAKE ACCUSATION
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4" id="chat-area">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === "assistant" ? "text-green-400" : "text-green-200"}`}>
            <div
              className="whitespace-pre-wrap animate-typewriter"
              style={{
                animation: `typewriter 0.04s steps(${msg.content.length}) forwards`,
                overflow: "hidden",
                borderRight: msg.role === "assistant" ? "2px solid #33ff66" : "none",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>
      <footer className="p-4 border-t border-green-600 flex items-center">
        {error && <ErrorBanner message={error} />}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          disabled={loading}
          className="flex-1 bg-black border border-green-600 rounded px-2 py-1 mr-2 focus:outline-none"
          placeholder="Ask a question..."
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded"
        >
          {loading ? <LoadingSpinner /> : "Send"}
        </button>
      </footer>
    </div>
  );
}
