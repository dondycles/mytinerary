import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const itinerary = pgTable("itinerary", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  dates: timestamp("dates").array().notNull(),
  hiddenDates: timestamp("hidden_dates").array(),
  privacy: text("privacy")
    .$type<"private" | "collaborative">()
    .default("private")
    .notNull(),
  people: text("people").array().notNull(),
  collabId: text("collabId")
    .$default(() => crypto.randomUUID())
    .notNull(),
});

export const activity = pgTable("activity", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  itineraryId: integer("itineraryId")
    .notNull()
    .references(() => itinerary.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  date: timestamp("date").notNull(),
});
