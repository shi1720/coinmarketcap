import { getMarket } from "@/lib/cmc";
export const dynamic = "force-dynamic";
// Quotes are public. Private workspace and report endpoints never expose CORS.
const publicOrigins = new Set([
  "https://runway-guard-cmc.web.app",
  "https://runway-guard-cmc.firebaseapp.com",
  "http://127.0.0.1:5174",
  "http://localhost:5174",
]);
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (origin && publicOrigins.has(origin))
    headers["Access-Control-Allow-Origin"] = origin;
  try {
    return Response.json(await getMarket(), { headers });
  } catch {
    return Response.json(
      { error: "Market data unavailable. Please retry." },
      { status: 503, headers },
    );
  }
}
