import { pgTable, uuid, varchar, text, doublePrecision, integer, timestamp } from "drizzle-orm/pg-core";

export const annotations = pgTable("annotations", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'pothole', 'steep_gradient', 'hazard', 'construction'
  description: text("description"),
  severity: integer("severity").default(1).notNull(), // 1 (minor) to 5 (critical)
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Annotation = typeof annotations.$inferSelect;
export type NewAnnotation = typeof annotations.$inferInsert;