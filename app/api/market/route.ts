import { getMarket } from "@/lib/cmc";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getMarket(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Market data unavailable. Please retry." },
      { status: 503 },
    );
  }
}
