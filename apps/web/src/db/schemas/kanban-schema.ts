import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organization } from "./auth-schema";

export const boards = pgTable(
  "boards",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // This unique index ensures that the 'slug' for a board is unique within the context
    // of its 'organizationId'. This prevents two boards in the same organization
    // from having the same slug, which is crucial for URL routing and data integrity.
    // While indexes primarily speed up queries, a unique index also enforces a
    // uniqueness constraint on the indexed columns.
    uniqueIndex("board_org_slug_idx").on(table.organizationId, table.slug),
  ],
);
