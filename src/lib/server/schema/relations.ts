import { relations } from "drizzle-orm";
import { activity, itinerary } from "./itinerary.schema";

export const itineraryRelations = relations(itinerary, ({ many }) => ({
  activitiesData: many(activity),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  itineraryData: one(itinerary, {
    fields: [activity.itineraryId],
    references: [itinerary.id],
  }),
}));
