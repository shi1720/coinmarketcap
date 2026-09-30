/** Bounded retries for transient failures. Never retry authorization or malformed-request errors. */
export async function fetchCMC(
  url: string,
  headers: Record<string, string>,
  fetcher: typeof fetch = fetch,
  sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await fetcher(url, {
        headers,
        signal: AbortSignal.timeout(7000),
      });
    } catch {
      if (attempt === 2) throw new Error("CMC network request unavailable.");
      await sleep(250 * 2 ** attempt);
      continue;
    }
    if (response.ok) return response;
    if (!(response.status === 429 || response.status >= 500) || attempt === 2)
      throw new Error(`CMC request unavailable (HTTP ${response.status}).`);
    await sleep(250 * 2 ** attempt);
  }
  throw new Error("CMC request unavailable.");
}
