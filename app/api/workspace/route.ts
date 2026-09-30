import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database } from "@/lib/storage";
import { workspaceSchema } from "@/lib/workspace";
import { sameOrigin, boundedJson, privateJson } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  const u = await getChatGPTUser();
  if (!u)
    return privateJson({ error: "Sign in to access your workspace." }, 401);
  try {
    const row = await database()
      .prepare("SELECT data,revision,updated_at FROM workspaces WHERE owner=?")
      .bind(u.userId)
      .first<{ data: string; revision: number; updated_at: string }>();
    return privateJson(
      row
        ? {
            workspace: JSON.parse(row.data),
            revision: row.revision,
            updatedAt: row.updated_at,
          }
        : { workspace: null, revision: 0 },
    );
  } catch {
    return privateJson({ error: "Workspace storage unavailable." }, 503);
  }
}
export async function PUT(r: Request) {
  const u = await getChatGPTUser();
  if (!u) return privateJson({ error: "Sign in to save." }, 401);
  if (!sameOrigin(r))
    return privateJson({ error: "Invalid request origin." }, 403);
  try {
    const body = await boundedJson(r);
    const parsed = workspaceSchema.safeParse(body.workspace);
    if (
      !parsed.success ||
      !Number.isInteger(body.revision) ||
      body.revision < 0
    )
      return privateJson(
        {
          error:
            "Check your treasury inputs. All amounts must be finite and non-negative.",
        },
        400,
      );
    const data = JSON.stringify(parsed.data),
      now = new Date().toISOString();
    const result =
      body.revision === 0
        ? await database()
            .prepare(
              "INSERT INTO workspaces (owner,data,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(owner) DO NOTHING",
            )
            .bind(u.userId, data, now)
            .run()
        : await database()
            .prepare(
              "UPDATE workspaces SET data=?,revision=revision+1,updated_at=? WHERE owner=? AND revision=?",
            )
            .bind(data, now, u.userId, body.revision)
            .run();
    if (result.meta.changes !== 1)
      return privateJson(
        {
          error:
            "This workspace changed in another tab. Reload before saving; your current draft is still here.",
        },
        409,
      );
    return privateJson({ revision: body.revision + 1, updatedAt: now });
  } catch {
    return privateJson(
      { error: "Could not save. Your draft is still here." },
      503,
    );
  }
}
