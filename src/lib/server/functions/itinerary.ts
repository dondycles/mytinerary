import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { and, arrayContains, asc, desc, eq, or, sql } from "drizzle-orm";
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
      people: [user.id],
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
        description: data.description,
        image: data.image,
        updatedAt: new Date(),
        dates: data.dates,
      })
      .where(and(arrayContains(itinerary.people, [user.id]), eq(itinerary.id, data.id)));
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
  .validator((data: typeof itinerary.$inferSelect) => data)
  .handler(async ({ data, context: { user } }) => {
    if (data.userId !== user.id) throw new Error("You are not the creator!");
    await db
      .delete(itinerary)
      .where(and(eq(itinerary.id, data.id), eq(itinerary.userId, user.id)));
  });

export const getItineraries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    return await db.query.itinerary.findMany({
      where: (itinerary) =>
        or(
          and(
            arrayContains(itinerary.people, [user.id]),
            eq(itinerary.privacy, "collaborative"),
          ),
          eq(itinerary.userId, user.id),
        ),
      orderBy: [desc(itinerary.createdAt)],
    });
  });

export const deepViewItinerary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context: { user }, data: id }) => {
    return await db.query.itinerary.findFirst({
      where: (itinerary, { eq }) =>
        and(
          or(
            and(
              arrayContains(itinerary.people, [user.id]),
              eq(itinerary.privacy, "collaborative"),
            ),
            eq(itinerary.userId, user.id),
          ),
          eq(itinerary.id, id),
        ),
      with: {
        activitiesData: {
          orderBy: [asc(activity.startTime)],
        },
      },
      extras: {
        peopleData: sql<(typeof user)[]>`(
    select json_agg(u) as people_data
    from "user" u
    where u.id = any(${itinerary.people})
  )`.as("people_data"),
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
      .where(and(arrayContains(itinerary.people, [user.id]), eq(itinerary.id, data.id)));
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
      .where(
        and(
          arrayContains(itinerary.people, [user.id]),
          eq(itinerary.id, itineraryData.id),
        ),
      );
  });

export const changeItineraryPrivacy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      privacy: (typeof itinerary.$inferSelect)["privacy"];
      id: number;
      itineraryData: typeof itinerary.$inferSelect;
    }) => data,
  )
  .handler(async ({ context: { user }, data: { privacy, id, itineraryData } }) => {
    if (itineraryData.userId !== user.id) throw new Error("You are not the creator!");
    await db
      .update(itinerary)
      .set({
        privacy,
      })
      .where(and(arrayContains(itinerary.people, [user.id]), eq(itinerary.id, id)));
  });

export const findCollaborationId = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: string) => data)
  .handler(async ({ context: { user }, data }) => {
    const itineraryData = await db.query.itinerary.findFirst({
      where: (itinerary, { eq }) => eq(itinerary.collabId, data),
    });
    if (itineraryData) {
      await db
        .update(itinerary)
        .set({
          people: [...itineraryData.people, user.id],
        })
        .where(eq(itinerary.id, itineraryData.id));
    }
    if (!itineraryData) throw new Error("CollabId Not Found!");
  });
