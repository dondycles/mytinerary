import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { activity, itinerary } from "../schema";

export const itinerarySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  image: z.string().optional(),
  dates: z.date().array().min(1, { message: "At least 1 date is required" }),
});

export const addItinerary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(itinerarySchema)
  .handler(async ({ context: { user }, data }) => {
    await db.insert(itinerary).values({
      name: data.name,
      userId: user.id,
      description: data.description,
      image: data.image,
      dates: data.dates,
    });
  });
export const editItinerary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    itinerarySchema.extend({ id: z.number(), pastDates: z.date().array().optional() }),
  )
  .handler(async ({ context: { user }, data }) => {
    await db
      .update(itinerary)
      .set({
        name: data.name,
        userId: user.id,
        description: data.description,
        image: data.image,
        updatedAt: new Date(),
        dates: data.dates,
      })
      .where(and(eq(itinerary.userId, user.id), eq(itinerary.id, data.id)));
    // if (data.pastDates) {
    //   const onlyInArr1 = data.pastDates.filter((val) => !data.dates.includes(val));
    //   const onlyInArr2 = data.dates.filter((val) => !data.pastDates!.includes(val));
    //   const toBeRemovedDates = [...new Set([...onlyInArr1, ...onlyInArr2])];
    //   console.log(toBeRemovedDates);
    //   await db.transaction(async (tx) => {
    //     for (const date of toBeRemovedDates) {
    //       await tx
    //         .delete(activity)
    //         .where(
    //           and(
    //             eq(activity.itineraryId, data.id),
    //             eq(activity.date, date),
    //             eq(activity.userId, user.id),
    //           ),
    //         );
    //     }
    //   });
    // }
  });
export const deleteItinerary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(itinerary).where(eq(itinerary.id, id));
  });

export const getItineraries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    return await db.query.itinerary.findMany({
      where: (itinerary, { eq }) => eq(itinerary.userId, user.id),
      orderBy: [desc(itinerary.createdAt)],
    });
  });

export const deepViewItinerary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context: { user }, data: id }) => {
    return await db.query.itinerary.findFirst({
      where: (itinerary, { eq }) =>
        and(eq(itinerary.userId, user.id), eq(itinerary.id, id)),
      with: {
        activitiesData: {
          orderBy: [asc(activity.startTime)],
        },
      },
    });
  });

export type Itinerary = NonNullable<Awaited<ReturnType<typeof deepViewItinerary>>>;

export const editItineraryImg = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(itinerarySchema.extend({ id: z.number() }))
  .handler(async ({ context: { user }, data }) => {
    await db
      .update(itinerary)
      .set({
        image: data.image,
        updatedAt: new Date(),
      })
      .where(and(eq(itinerary.userId, user.id), eq(itinerary.id, data.id)));
  });

export const hideThisDate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: { itineraryData: typeof itinerary.$inferSelect; hideThisDate: Date }) => data,
  )
  .handler(async ({ context: { user }, data: { itineraryData, hideThisDate } }) => {
    const newDate = itineraryData.hiddenDates
      ? [...itineraryData.hiddenDates, hideThisDate]
      : [hideThisDate];
    await db
      .update(itinerary)
      .set({
        hiddenDates: newDate,
        updatedAt: new Date(),
      })
      .where(and(eq(itinerary.userId, user.id), eq(itinerary.id, itineraryData.id)));
  });
