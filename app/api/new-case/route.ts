import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { CaseSchema, extractPublicBriefing } from '@/lib/caseSchema';
import { generateCasePrompt } from '@/lib/prompts';
import { caseStore } from '@/lib/caseStore';
import { callGeminiWithRetry } from '@/lib/geminiHelper';

import { callGeminiWithFallback } from '@/lib/geminiFallback';

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.8-flash',
];

export async function POST(request: Request) {
  try {
    const { difficulty } = (await request.json()) as { difficulty?: 'Easy' | 'Medium' | 'Hard' };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const prompt = generateCasePrompt(difficulty);

    const askGemini = async (model: string) => {
      const result = await genAI.models.generateContent({
        model,
        contents: prompt,
      });
      const text = result.text ?? '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    };

    const rawCase = await callGeminiWithFallback(FALLBACK_MODELS, askGemini);
    const parseResult = CaseSchema.safeParse(rawCase);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Failed to generate a valid case schema' }, { status: 500 });
    }

    const fullCase = parseResult.data;
    const sessionId = uuidv4();
    caseStore.set(sessionId, fullCase);

    const briefing = extractPublicBriefing(fullCase);
    const response = NextResponse.json({ sessionId, briefing });
    response.cookies.set('sessionId', sessionId, { httpOnly: true, path: '/', sameSite: 'lax' });
    return response;
  } catch (err: any) {
    console.error('Error creating case:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
