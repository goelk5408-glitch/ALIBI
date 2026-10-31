import { z } from 'zod';

export const CaseSchema = z.object({
  setting: z.string(),
  victim: z.object({
    name: z.string(),
    description: z.string(),
  }),
  timeOfDeath: z.string(),
  culpritId: z.string(),
  motive: z.string(),
  trueTimeline: z.array(
    z.object({
      time: z.string(),
      event: z.string(),
    })
  ),
  suspects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      publicDescription: z.string(),
      personality: z.string(),
      alibi: z.string(),
      truth: z.string(),
      secrets: z.array(z.string()),
      lies: z.array(
        z.object({
          claim: z.string(),
          contradictedBy: z.string(),
        })
      ),
      knowsAboutOthers: z.array(z.string()),
    })
  ),
});

// Types for full case and public briefing
export type FullCase = z.infer<typeof CaseSchema>;

export const PublicBriefingSchema = z.object({
  setting: z.string(),
  victim: z.object({
    name: z.string(),
    description: z.string(),
  }),
  timeOfDeath: z.string(),
  suspects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      publicDescription: z.string(),
    })
  ),
});

export type PublicBriefing = z.infer<typeof PublicBriefingSchema>;

export const extractPublicBriefing = (full: FullCase): PublicBriefing => {
  const { setting, victim, timeOfDeath, suspects } = full;
  return {
    setting,
    victim,
    timeOfDeath,
    suspects: suspects.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      publicDescription: s.publicDescription,
    })),
  };
};
