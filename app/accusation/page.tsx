"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingSpinner from "../../components/LoadingSpinner";

type Note = {
  id: string;
  suspectId: string;
  content: string;
};

type Contradiction = {
  noteAId: string;
  noteBId: string;
};

type Briefing = {
  setting: string;
  victim: { name: string; description: string };
  timeOfDeath: string;
  suspects: { id: string; name: string; role: string; publicDescription: string }[];
};

type AccusationResult = {
  correct: boolean;
  score: number;
  rank: string;
  fullCase: any;
  selectedContradiction: [string, string];
};

export default function AccusationPage() {
  const router = useRouter();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [selectedCulpritId, setSelectedCulpritId] = useState<string>("");
  const [motive, setMotive] = useState<string>("");
  const [selectedContradiction, setSelectedContradiction] = useState<[string, string]>(["", ""]);
  const [result, setResult] = useState<AccusationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [attemptNumber, setAttemptNumber] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const b = sessionStorage.getItem("briefing");
      if (b) setBriefing(JSON.parse(b) as Briefing);
      const n = sessionStorage.getItem("notes");
      if (n) setNotes(JSON.parse(n) as Note[]);
      const c = sessionStorage.getItem("contradictions");
      if (c) setContradictions(JSON.parse(c) as Contradiction[]);
      const a = sessionStorage.getItem("attemptNumber");
      if (a) setAttemptNumber(Number(a));
    }
  }, []);

  const submitAccusation = async () => {
    if (!selectedCulpritId || !motive) {
      setError("Please select a culprit and enter their motive.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        culpritId: selectedCulpritId,
        motive,
        contradictionIds: selectedContradiction,
        questionCount: Number(sessionStorage.getItem("questionCount") ?? "0"),
        attemptNumber,
      };
      const res = await fetch("/api/accusation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Accusation submission failed");
      }
      const data: AccusationResult = await res.json();
      setResult(data);
      if (typeof window !== "undefined" && data.fullCase) {
        sessionStorage.setItem("revealedCase", JSON.stringify(data.fullCase));
      }
      const nextAttempt = attemptNumber + 1;
      setAttemptNumber(nextAttempt);
      sessionStorage.setItem("attemptNumber", String(nextAttempt));
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to submit accusation.");
    } finally {
      setLoading(false);
    }
  };

  const pickContradiction = (ids: [string, string]) => {
    if (selectedContradiction[0] === ids[0] && selectedContradiction[1] === ids[1]) {
      setSelectedContradiction(["", ""]);
    } else {
      setSelectedContradiction(ids);
    }
  };

  if (!briefing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Loading briefing data...</p>
      </div>
    );
  }

  if (result) {
    const { correct, score, rank, selectedContradiction: selContr } = result;
    return (
      <div className="p-4 max-w-3xl mx-auto flex flex-col gap-4">
        <h2 className="text-3xl font-bold mb-2">Accusation Verdict</h2>
        <div className={`p-4 border rounded ${correct ? "border-green-500 bg-green-950/40" : "border-red-500 bg-red-950/40"}`}>
          <p className="text-2xl font-bold mb-2">
            {correct ? "🎉 CASE SOLVED: ACCUSATION CONFIRMED!" : "❌ ACCUSATION INCORRECT"}
          </p>
          <p className="text-lg">Final Score: <span className="font-bold text-green-300">{score}</span> | Detective Rank: <span className="font-bold text-yellow-300">{rank}</span></p>
        </div>

        {selContr && selContr[0] && (
          <div className="border border-green-700 p-3 rounded text-sm">
            <h3 className="font-semibold text-green-400 mb-1">Key Contradiction Presented:</h3>
            <ul className="list-disc list-inside">
              {selContr.map((id) => {
                const note = notes.find((n) => n.id === id);
                return <li key={id}>{note?.content || `Evidence note ${id}`}</li>;
              })}
            </ul>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push("/reveal")}
            className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded font-bold transition"
          >
            View Detailed Reveal & Full Dossier
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border border-green-600 hover:bg-green-900/40 rounded transition"
          >
            Return to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}
      <h2 className="text-2xl font-bold mb-2">Formal Indictment</h2>
      
      <div className="flex flex-col gap-1">
        <label className="font-semibold">Prime Suspect</label>
        <select
          value={selectedCulpritId}
          onChange={(e) => setSelectedCulpritId(e.target.value)}
          className="w-full bg-black border border-green-600 rounded p-2 text-green-400 focus:outline-none"
        >
          <option value="">Select a suspect...</option>
          {briefing.suspects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.role}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold">Motive</label>
        <input
          type="text"
          value={motive}
          onChange={(e) => setMotive(e.target.value)}
          className="w-full bg-black border border-green-600 rounded p-2 text-green-400 focus:outline-none"
          placeholder="State why the suspect committed the murder..."
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold">Contradiction Evidence (Optional bonus)</label>
        {contradictions.length === 0 ? (
          <p className="text-sm opacity-70">No recorded contradictions found in notes.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {contradictions.map((c, idx) => {
              const noteA = notes.find((n) => n.id === c.noteAId);
              const noteB = notes.find((n) => n.id === c.noteBId);
              const ids: [string, string] = [c.noteAId, c.noteBId];
              const selected = selectedContradiction[0] === ids[0] && selectedContradiction[1] === ids[1];
              return (
                <div
                  key={idx}
                  className={`border border-green-600 rounded p-2 cursor-pointer transition ${selected ? "bg-green-800 text-white" : "hover:bg-green-950/40"}`}
                  onClick={() => pickContradiction(ids)}
                >
                  <p className="text-xs">
                    "{noteA?.content?.slice(0, 50)}..." ↔ "{noteB?.content?.slice(0, 50)}..."
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-2">
        <button
          onClick={submitAccusation}
          disabled={loading}
          className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded font-bold transition disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : "Submit Accusation"}
        </button>
        <button
          onClick={() => router.push("/interrogation")}
          className="px-4 py-2 border border-green-600 hover:bg-green-950/40 rounded transition"
        >
          Back to Interrogation
        </button>
      </div>
    </div>
  );
}
