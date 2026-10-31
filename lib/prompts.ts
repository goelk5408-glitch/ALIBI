/** Prompt utilities for Gemini generation */

export const generateCasePrompt = (difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): string => {
  const difficultyInstruction = {
    Easy: 'Make the mystery straightforward with clear clues and only one obvious lie per innocent suspect.',
    Medium: 'Create a balanced case with a few secrets and subtle contradictions.',
    Hard: 'Design a complex case with many red herrings, multiple secrets, and nuanced lies.',
  }[difficulty];

  return `You are an AI author for a detective game. Generate a single murder case as STRICT JSON that conforms EXACTLY to the following schema:\n\n${JSON.stringify(
    {
      setting: 'string',
      victim: { name: 'string', description: 'string' },
      timeOfDeath: 'string',
      culpritId: 'string',
      motive: 'string',
      trueTimeline: [{ time: 'string', event: 'string' }],
      suspects: [
        {
          id: 'string',
          name: 'string',
          role: 'string',
          publicDescription: 'string',
          personality: 'string',
          alibi: 'string',
          truth: 'string',
          secrets: ['string'],
          lies: [{ claim: 'string', contradictedBy: 'string' }],
          knowsAboutOthers: ['string'],
        },
      ],
    },
    null,
    2
  )}\n\nRules:\n- Exactly one suspect must have id matching \"culpritId\" and be the murderer.\n- All innocent suspects must have at least one embarrassing secret (red herring).\n- The culprit must have at least two lies that can be caught by cross‑checking other suspects' statements.\n- The case must be solvable based on the public information.\n- Keep the story coherent and avoid contradictions with the TRUE TIMELINE.\n- Use the following difficulty hint: ${difficultyInstruction}\n\nReturn ONLY the JSON object with no extra commentary.`;
};

/** Build the system prompt for a suspect */
export const generateSuspectPrompt = (suspect: {
  name: string;
  role: string;
  personality: string;
  truth: string;
  alibi: string;
  secrets: string[];
  lies: { claim: string; contradictedBy: string }[];
  knowsAboutOthers: string[];
}): string => {
  const { name, role, personality, truth, alibi, secrets, lies, knowsAboutOthers } = suspect;
  const secretsStr = secrets.length ? secrets.join(', ') : 'none';
  const liesStr = lies.map((l) => `${l.claim} (contradicted by ${l.contradictedBy})`).join('\n');
  const knowsStr = knowsAboutOthers.length ? knowsAboutOthers.join(', ') : 'none';

  return `You are ${name}, ${role}, a suspect in a murder investigation. Personality: ${personality}.
You MUST stay in character. Never reveal you are an AI. Never break the fourth wall.

WHAT ACTUALLY HAPPENED (only you know this): ${truth}
YOUR OFFICIAL STORY (what you tell the detective): ${alibi}
YOUR SECRETS (hide these unless strongly pressured with specific evidence): ${secretsStr}
YOUR LIES:
${liesStr}
WHAT YOU KNOW ABOUT OTHER SUSPECTS: ${knowsStr}

BEHAVIOR RULES:
- If you are innocent: be honest about the murder, but protect your personal secrets until pressed. Get defensive, not confessing.
- If you are the culprit: never confess outright. Stay consistent with your alibi. When shown a specific contradiction, get nervous, deflect, add a new (weaker) lie, and slip slightly more as pressure builds.
- Only reveal a secret if the player cites specific, relevant evidence or repeatedly pressures you on that exact topic.
- Keep answers to 2-4 sentences. Speak naturally, in‑character.
- Never invent facts that contradict the TRUE TIMELINE.
- Do not volunteer information the player did not ask about.`;
};
