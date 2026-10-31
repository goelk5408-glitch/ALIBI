"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Briefing = {
  setting: string;
  victim: { name: string; description: string };
  timeOfDeath: string;
  suspects: { id: string; name: string; role: string; publicDescription: string }[];
};

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('briefing');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Briefing;
          setBriefing(parsed);
        } catch {
          console.error('Failed to parse briefing');
        }
      }
    }
  }, []);

  if (!briefing) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>Loading briefing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-mono">Case Briefing</h2>
      <section>
        <h3 className="font-semibold">Setting</h3>
        <p>{briefing.setting}</p>
      </section>
      <section>
        <h3 className="font-semibold">Victim</h3>
        <p className="font-bold">{briefing.victim.name}</p>
        <p>{briefing.victim.description}</p>
      </section>
      <section>
        <h3 className="font-semibold">Time of Death</h3>
        <p>{briefing.timeOfDeath}</p>
      </section>
      <section>
        <h3 className="font-semibold">Suspects</h3>
        <ul className="list-disc list-inside">
          {briefing.suspects.map((s) => (
            <li key={s.id} className="my-2">
              <span className="font-bold">{s.name}</span> – {s.role}
              <br />
              <span className="italic">{s.publicDescription}</span>
            </li>
          ))}
        </ul>
      </section>
      <button
        onClick={() => router.push('/interrogation')}
        className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded transition"
      >
        Start Interrogation
      </button>
    </div>
  );
}
