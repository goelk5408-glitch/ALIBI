/**
 * Helper for calling Gemini model with simple exponential backoff retry.
 * Handles transient errors such as rate limiting (429) or network hiccups.
 */
export async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 500,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      // If we've exhausted attempts, rethrow.
      if (attempt >= maxAttempts) throw err;
      // Simple exponential backoff.
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
