// Zod unit test for CaseSchema and public briefing extraction
import { describe, expect, test } from "@jest/globals";
import { CaseSchema, extractPublicBriefing } from "../caseSchema";

// Mock a minimal valid case matching the schema
const mockCase = {
  setting: "Victorian London",
  victim: { name: "John Doe", description: "A wealthy merchant" },
  timeOfDeath: "2023-01-01T20:00:00Z",
  culpritId: "suspect-1",
  motive: "Inheritance",
  trueTimeline: [{ time: "19:45", event: "Victim met suspect" }],
  suspects: [
    {
      id: "suspect-1",
      name: "Alice",
      role: "Butler",
      publicDescription: "Serves the household",
      personality: "Calm",
      alibi: "Was in kitchen",
      truth: "Killed the victim",
      secrets: ["Steals silver"],
      lies: [{ claim: "I was asleep", contradictedBy: "Witness" }],
      knowsAboutOthers: []
    },
    {
      id: "suspect-2",
      name: "Bob",
      role: "Gardener",
      publicDescription: "Cares for the garden",
      personality: "Cheerful",
      alibi: "Working outside",
      truth: "Innocent",
      secrets: ["Had a crush on victim"],
      lies: [{ claim: "Did not see anything", contradictedBy: "None" }],
      knowsAboutOthers: []
    }
  ]
};

describe("CaseSchema validation", () => {
  test("valid mock case passes Zod schema", () => {
    const parseResult = CaseSchema.safeParse(mockCase);
    expect(parseResult.success).toBe(true);
  });
});

describe("extractPublicBriefing utility", () => {
  test("returns only public fields", () => {
    const briefing = extractPublicBriefing(mockCase as any);
    // Should contain setting, victim, timeOfDeath, and suspects with only public fields
    expect(briefing).toMatchObject({
      setting: mockCase.setting,
      victim: mockCase.victim,
      timeOfDeath: mockCase.timeOfDeath,
    });
    // suspects array length matches original
    expect(briefing.suspects).toHaveLength(mockCase.suspects.length);
    // each suspect should only have id, name, role, publicDescription
    briefing.suspects.forEach((s: any, idx: number) => {
      const original = mockCase.suspects[idx];
      expect(s).toEqual({
        id: original.id,
        name: original.name,
        role: original.role,
        publicDescription: original.publicDescription,
      });
    });
  });
});
