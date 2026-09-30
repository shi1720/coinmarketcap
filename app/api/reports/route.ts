import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database } from "@/lib/storage";
import { getMarket } from "@/lib/cmc";
import { analyzeTreasury } from "@/lib/analysis";
import { workspaceSchema } from "@/lib/workspace";
import {
  sameOrigin,
  boundedJson,
  privateJson,
  HttpInputError,
} from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(r: Request) {
  const u = await getChatGPTUser();
  if (!u) return privateJson({ error: "Sign in to view reports." }, 401);
  try {
    const id = new URL(r.url).searchParams.get("id");
    if (id) {
      const row = await database()
        .prepare("SELECT data FROM reports WHERE id=? AND owner=?")
        .bind(id, u.userId)
        .first<{ data: string }>();
      return row
        ? privateJson(JSON.parse(row.data))
        : privateJson({ error: "Report not found." }, 404);
    }
    const result = await database()
      .prepare(
        "SELECT id,created_at FROM reports WHERE owner=? ORDER BY created_at DESC LIMIT 30",
      )
      .bind(u.userId)
      .all();
    return privateJson({ reports: result.results });
  } catch {
    return privateJson({ error: "Report storage unavailable." }, 503);
  }
}
export async function POST(r: Request) {
  const u = await getChatGPTUser();
  if (!u)
    return privateJson({ error: "Sign in to save a decision record." }, 401);
  if (!sameOrigin(r))
    return privateJson({ error: "Invalid request origin." }, 403);
  try {
    const body = await boundedJson(r);
    const p = workspaceSchema.safeParse(body.workspace);
    if (!p.success)
      return privateJson({ error: "Invalid workspace inputs." }, 400);
    if (
      p.data.config.monthlyBurn === 0 &&
      !p.data.obligations.some((o) => o.amount > 0)
    )
      return privateJson(
        {
          error: "Add operating commitments before creating a decision record.",
        },
        422,
      );
    const market = await getMarket();
    if (market.cache === "stale")
      return privateJson(
        { error: "Refresh live prices before saving a decision record." },
        503,
      );
    const now = new Date().toISOString();
    let analysis;
    try {
      analysis = analyzeTreasury({
        ...p.data,
        quotes: market.quotes,
        asOf: now,
      });
    } catch {
      return privateJson(
        {
          error:
            "Financial inputs exceed supported precision. Check your balances.",
        },
        422,
      );
    }
    if (
      analysis.readiness === "blocked" ||
      analysis.warnings.some((w) => w.code === "STALE_QUOTE")
    )
      return privateJson(
        { error: "Resolve incomplete inputs or stale quotes before saving." },
        422,
      );
    const record = {
      id: crypto.randomUUID(),
      createdAt: now,
      workspace: p.data,
      analysis,
      market,
      sample: p.data.provenance === "sample",
    };
    await database()
      .prepare(
        "INSERT INTO reports (id,owner,data,created_at) VALUES (?,?,?,?)",
      )
      .bind(record.id, u.userId, JSON.stringify(record), now)
      .run();
    return privateJson(record, 201);
  } catch (error) {
    if (error instanceof HttpInputError)
      return privateJson({ error: error.message }, error.status);
    return privateJson(
      { error: "Could not create a report. Your workspace is preserved." },
      503,
    );
  }
}
