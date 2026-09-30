import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const workspaces = sqliteTable("workspaces", {
  owner: text("owner").primaryKey(),
  data: text("data").notNull(),
  revision: integer("revision").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
});
export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    data: text("data").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("idx_reports_owner_created").on(t.owner, t.createdAt)],
);
export const marketCache = sqliteTable("market_cache", {
  key: text("key").primaryKey(),
  data: text("data").notNull(),
  fetchedAt: text("fetched_at").notNull(),
});
