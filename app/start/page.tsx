"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingSpinner from "../../components/LoadingSpinner";

type Briefing = {
  setting: string;
  victim: { name: string; description: string };
  timeOfDeath: string;
  suspects: { id: string; name: string; role: string; publicDescription: string }[];
};

export default function StartScreen() {
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const startCase = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/new-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate case");
      }
      const data = await res.json();
      const briefing: Briefing = data.briefing;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("briefing", JSON.stringify(briefing));
        sessionStorage.setItem("sessionId", data.sessionId);
        sessionStorage.setItem("questionCount", "0");
        sessionStorage.setItem("attemptNumber", "1");
        sessionStorage.removeItem("notes");
        sessionStorage.removeItem("contradictions");
      }
      router.push("/briefing");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Could not start a new case. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {error && <ErrorBanner message={error} />}
      <h2 className="text-2xl mb-2 text-center">Everyone has a story. One of them is lying.</h2>
      <div className="flex gap-4 items-center">
        {(["Easy", "Medium", "Hard"] as const).map((lvl) => (
          <label key={lvl} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="difficulty"
              value={lvl}
              checked={difficulty === lvl}
              onChange={() => setDifficulty(lvl)}
              className="accent-green-500"
            />
            {lvl}
          </label>
        ))}
      </div>
      <button
        onClick={startCase}
        disabled={loading}
        className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded transition font-bold disabled:opacity-50"
      >
        {loading ? <LoadingSpinner /> : "NEW CASE"}
      </button>
    </div>
  );
}
