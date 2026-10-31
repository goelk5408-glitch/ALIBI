import { NextRequest, NextResponse } from 'next/server';
import { caseStore } from '@/lib/caseStore';
import { FullCase } from '@/lib/caseSchema';

type AccusationPayload = {
  culpritId: string;
  motive: string;
  contradictionIds: [string, string]; // note IDs selected as key contradiction
  questionCount?: number; // optional, from client
  attemptNumber?: number; // optional, from client
  sessionId?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AccusationPayload;
  const sessionId = request.cookies.get('sessionId')?.value || body.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session' }, { status: 400 });
  }

  const fullCase = caseStore.get(sessionId) as FullCase | undefined;
  if (!fullCase) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  const {
    culpritId,
    motive,
    contradictionIds,
    questionCount = 0,
    attemptNumber = 1,
  } = (await request.json()) as AccusationPayload;

  // Enforce max two attempts
  if (attemptNumber > 2) {
    return NextResponse.json({ error: 'Maximum accusation attempts exceeded' }, { status: 400 });
  }

  // Base scoring
  let score = 100;
  // Penalty for excess questions
  if (questionCount > 15) {
    score -= (questionCount - 15) * 5;
  }
  // Penalty for wrong attempts (first attempt no penalty, subsequent -15)
  if (attemptNumber > 1) {
    score -= 15 * (attemptNumber - 1);
  }

  const correctCulprit = culpritId === fullCase.culpritId;
  const motiveMatches = motive.trim().toLowerCase() === fullCase.motive.trim().toLowerCase();
  const correct = correctCulprit && motiveMatches;

  if (correct) {
    // Bonus for correct accusation
    score += 20;
    // Bonus for correctly identifying motive (already part of correct) – give extra small bonus
    score += 5;
    // Bonus for providing a key contradiction (assume any selected pair is acceptable)
    if (contradictionIds[0] && contradictionIds[1]) {
      score += 5;
    }
  }

  // Determine rank based on final score
  let rank = 'Rookie';
  if (score >= 120) rank = 'Sherlock';
  else if (score >= 100) rank = 'Inspector';

  return NextResponse.json({
    correct,
    score,
    rank,
    fullCase,
    selectedContradiction: contradictionIds,
    attemptNumber,
  });
}

