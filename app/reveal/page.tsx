"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RevealPage() {
  const router = useRouter();
  const [fullCase, setFullCase] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("revealedCase");
      if (stored) {
        try {
          setFullCase(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse revealed case", e);
        }
      }
    }
  }, []);

  if (!fullCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl">No case file revealed yet.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  const culprit = fullCase.suspects?.find((s: any) => s.id === fullCase.culpritId);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div className="border border-green-600 p-4 rounded bg-black/60">
        <h2 className="text-3xl font-bold mb-2 text-green-400">CASE FILE DECLASSIFIED</h2>
        <p className="text-sm opacity-80 mb-4">Location: {fullCase.setting} | Time of Death: {fullCase.timeOfDeath}</p>
        
        <div className="border-t border-green-700/60 pt-3 mb-4">
          <h3 className="text-xl font-semibold text-green-300">The Victim</h3>
          <p className="font-bold">{fullCase.victim?.name}</p>
          <p className="text-sm">{fullCase.victim?.description}</p>
        </div>

        <div className="border-t border-green-700/60 pt-3 mb-4">
          <h3 className="text-xl font-semibold text-red-400">The True Culprit & Motive</h3>
          <p className="font-bold text-lg">{culprit?.name} ({culprit?.role})</p>
          <p className="mt-1"><span className="underline">Motive:</span> {fullCase.motive}</p>
          <p className="mt-1"><span className="underline">True Action:</span> {culprit?.truth}</p>
        </div>

        <div className="border-t border-green-700/60 pt-3 mb-4">
          <h3 className="text-xl font-semibold text-green-300 mb-2">The True Timeline</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {fullCase.trueTimeline?.map((item: any, i: number) => (
              <li key={i}>
                <span className="font-semibold text-green-400">[{item.time}]</span> {item.event}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-green-700/60 pt-3">
          <h3 className="text-xl font-semibold text-green-300 mb-2">Suspect Dossiers & Lies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {fullCase.suspects?.map((s: any) => (
              <div key={s.id} className="border border-green-800 p-3 rounded bg-black/40 text-sm">
                <p className="font-bold text-green-400 text-base">{s.name} - {s.role}</p>
                <p className="text-xs italic mb-2 text-gray-400">Alibi: "{s.alibi}"</p>
                <p className="text-xs mb-1"><strong className="text-yellow-400">Secrets:</strong> {s.secrets?.join(", ") || "None"}</p>
                <div className="text-xs mt-1">
                  <strong className="text-red-400">Lies Caught:</strong>
                  <ul className="list-disc list-inside ml-1">
                    {s.lies?.map((l: any, idx: number) => (
                      <li key={idx}>"{l.claim}" — Contradicted by {l.contradictedBy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded transition font-bold"
        >
          Start New Case
        </button>
      </div>
    </div>
  );
}
