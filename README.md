# ALIBI_ 🕵️‍♂️🔍

> **"Everyone has a story. One of them is lying."**

ALIBI is a retro terminal-themed, AI-driven detective deduction game built using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Google Gemini API** (`@google/genai`).

🎮 **Live Demo:** [https://alibi-detective.vercel.app](https://alibi-detective.vercel.app)

---

## 🕹️ Game Overview

In **ALIBI**, you assume the role of an investigator assigned to solve an unsolved murder mystery generated dynamically by Gemini AI:

1. **New Case Generation**: Each playthrough generates a unique victim, crime scene setting, suspects, secrets, true timeline, and murder motive.
2. **Case Briefing**: Review public profiles, relationships, and the initial police dossier.
3. **Suspect Interrogation**: Interrogate each suspect in real time via an interactive terminal. Each suspect stays strictly in character, holds distinct secrets, and will react with nervous slips when pressed.
4. **Notes & Contradiction Pinning**: Pin crucial witness quotes and mark contradictions between testimonies.
5. **Accusation & Verdict**: Formally indict the prime suspect, state their motive, and submit contradiction evidence.
6. **Case Declassification (Reveal)**: View the full case breakdown, the true timeline of events, suspect lies caught, your detective rank, and final score.

---

## 💻 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions / Route Handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode, `no any`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Custom CRT scanline & retro green phosphor theme)
- **AI Engine:** [Google Gemini 3.8 Flash](https://ai.google.dev/) via `@google/genai` (Server-side execution only)
- **Schema & Validation:** [Zod](https://zod.dev/)
- **Hosting & Deployment:** [Vercel](https://vercel.com/)

---

## 🛡️ Security & Architecture

- **Server-Side AI Secrets:** The `GEMINI_API_KEY` is exclusively consumed in server-side API routes (`/api/new-case`, `/api/interrogate`, `/api/accusation`). No keys or raw system prompts are exposed to the client.
- **In-Memory Secure State:** Full case solutions (including the murderer's identity and timeline) remain in server memory keyed by an `HttpOnly` session cookie during the game.
- **Client Sanitization:** Only public dossier fields are shared with the browser until the case is officially closed and declassified.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20+
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey) or [Google Cloud](https://console.cloud.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/goelk5408-glitch/alibi.git
   cd alibi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Play:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run unit tests for schema validation and public briefing sanitization:
```bash
npm run test
```

---

## 📜 License

MIT License. Crafted with 🕵️‍♂️ for AI and detective game enthusiasts.
