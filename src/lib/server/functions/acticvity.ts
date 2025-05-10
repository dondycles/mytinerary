import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { activity } from "../schema";

export const activitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
});

export const addActivity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(activitySchema.extend({ itineraryId: z.number(), date: z.date() }))
  .handler(async ({ context: { user }, data }) => {
    await db.insert(activity).values({
      name: data.name,
      userId: user.id,
      description: data.description,
      startTime: data.startDate,
      endTime: data.endDate,
      itineraryId: data.itineraryId,
      date: data.date,
    });
  });

export const deleteActivity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ context: { user }, data: { id } }) => {
    await db
      .delete(activity)
      .where(and(eq(activity.id, id), eq(activity.userId, user.id)));
  });
export const deleteActivities = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { ids: number[] }) => data)
  .handler(async ({ context: { user }, data: { ids } }) => {
    // const dates = {
    //   start: itineraryData.startDate,
    //   end: itineraryData.endDate,
    // };
    await db.transaction(async (tx) => {
      for (const id of ids) {
        await tx
          .delete(activity)
          .where(and(eq(activity.id, id), eq(activity.userId, user.id)));
      }
    });
    // if (differenceInCalendarDays(dates.end, dates.start) !== 0) {
    //   await db
    //     .update(itinerary)
    //     .set({
    //       startDate: addDays(itineraryData.startDate, 1),
    //     })
    //     .where(and(eq(itinerary.id, itineraryData.id), eq(itinerary.userId, user.id)));
    // }
  });
