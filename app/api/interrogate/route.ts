import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { caseStore } from '@/lib/caseStore';
import { generateSuspectPrompt } from '@/lib/prompts';
import { callGeminiWithRetry } from '@/lib/geminiHelper';
import type { FullCase } from '@/lib/caseSchema';

export async function POST(request: NextRequest) {
  try {
    const { suspectId, message, chatHistory } = (await request.json()) as {
      suspectId: string;
      message: string;
      chatHistory: { role: 'user' | 'assistant'; content: string }[];
    };

    const sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session' }, { status: 400 });
    }

    const fullCase = caseStore.get(sessionId) as FullCase | undefined;
    if (!fullCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const suspect = fullCase.suspects.find((s) => s.id === suspectId);
    if (!suspect) {
      return NextResponse.json({ error: 'Suspect not found' }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY missing' }, { status: 500 });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const systemPrompt = generateSuspectPrompt(suspect);

    // Build conversation: system instruction + recent chat + new user message
    const recent = chatHistory.slice(-12);
    const conversationParts = recent.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }));
    conversationParts.push({ role: 'user' as const, parts: [{ text: message }] });

    const result = await callGeminiWithRetry(() =>
      genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationParts,
        config: {
          systemInstruction: systemPrompt,
        },
      })
    );

    const reply = result.text ?? '';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Error in interrogation:', err);
    return NextResponse.json({ error: err.message || 'Interrogation failed' }, { status: 500 });
  }
}
