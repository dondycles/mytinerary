import z from "zod";
import { itinerarySchema } from "../server/functions/itinerary";

export type ItinerarySchema = z.infer<typeof itinerarySchema>;
