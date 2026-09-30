import { env } from "cloudflare:workers";
export function database(): D1Database {
  if (!env.DB)
    throw new Error(
      "Storage temporarily unavailable. Your draft has not been saved.",
    );
  return env.DB;
}
