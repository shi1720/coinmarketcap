export async function GET() {
  return Response.json({ ok: true, service: "runway-guard", version: "1.0.0" });
}
