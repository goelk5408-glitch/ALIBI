import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { caseStore } from '@/lib/caseStore';
import { generateSuspectPrompt } from '@/lib/prompts';
import { callGeminiWithRetry } from '@/lib/geminiHelper';
import type { FullCase } from '@/lib/caseSchema';

export async function POST(request: NextRequest) {
  try {
    const { suspectId, message, chatHistory, sessionId: bodySessionId } = (await request.json()) as {
      suspectId: string;
      message: string;
      chatHistory: { role: 'user' | 'assistant'; content: string }[];
      sessionId?: string;
    };

    const sessionId = request.cookies.get('sessionId')?.value || bodySessionId;
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

    // Format messages for Gemini SDK:
    // SDK expects content as string or array of parts
    const conversationParts = recent.map((msg) => `${msg.role === 'assistant' ? suspect.name : 'Detective'}: ${msg.content}`).join('\n');
    const promptWithHistory = `${conversationParts ? conversationParts + '\n' : ''}Detective: ${message}\n${suspect.name}:`;

    const result = await callGeminiWithRetry(() =>
      genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptWithHistory,
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
