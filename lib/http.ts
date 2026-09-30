export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
export async function boundedJson(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 32768)
    throw new Error("Request too large");
  const raw = await request.text();
  if (raw.length > 32768) throw new Error("Request too large");
  return JSON.parse(raw);
}
export function privateJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
