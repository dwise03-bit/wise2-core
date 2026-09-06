import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  services: text("services").notNull(),
  idea: text("idea").notNull(),
  goal: text("goal").notNull(),
  status: text("status").notNull().default("new"),
  sourcePath: text("source_path").notNull().default("/start"),
}, (table) => [index("idx_inquiries_status_created_at").on(table.status, table.createdAt)]);
