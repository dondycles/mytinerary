import { queryOptions } from "@tanstack/react-query";
import { deepViewItinerary, getItineraries } from "../server/functions/itinerary";

export const getItinerariesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["itineraries", userId],
    queryFn: getItineraries,
  });

export const deepViewItineraryQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["itinerary", id],
    queryFn: async () => {
      const result = await deepViewItinerary({ data: id });
      if (!result) {
        throw new Error("deepViewItinerary returned undefined");
      }
      return result;
    },
  });
