import { FullCase } from '@/lib/caseSchema';

// In‑memory store for V1 (sessionId → full case)
export const caseStore = new Map<string, FullCase>();

