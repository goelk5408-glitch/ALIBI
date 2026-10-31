/**
 * Helper to call Gemini with automatic model fallback across multiple models.
 * If one model hits quota limit (429/RESOURCE_EXHAUSTED), it falls back to another.
 */
export async function callGeminiWithFallback<T>(
  modelNames: string[],
  generateFn: (model: string) => Promise<T>
): Promise<T> {
  let lastError: any = null;

  for (const model of modelNames) {
    try {
      return await generateFn(model);
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message || err);
      lastError = err;
      const errMsg = (err.message || "").toLowerCase();
      // If quota exceeded or unavailable or not found, try next model
      if (
        errMsg.includes("quota") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("429") ||
        errMsg.includes("unavailable") ||
        errMsg.includes("503") ||
        errMsg.includes("not_found") ||
        errMsg.includes("404")
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("All Gemini models exhausted");
}
