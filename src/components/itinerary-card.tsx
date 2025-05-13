import { itinerary as itineraryTypes } from "@/lib/server/schema";
import { Link } from "@tanstack/react-router";

export default function ItineraryCard({
  itinerary,
}: {
  itinerary: typeof itineraryTypes.$inferSelect;
}) {
  return (
    <Link to="/itineraries/$id" params={{ id: itinerary.id.toString() }}>
      <div className="w-full max-w-2xl space-y-4 rounded-3xl border p-4">
        {itinerary.image ? (
          <img
            src={itinerary.image}
            className="aspect-video w-full rounded-2xl object-cover object-center"
          />
        ) : null}
        <div className="space-y-2">
          <p className="truncate text-2xl font-bold sm:text-4xl md:text-5xl">
            {itinerary.name}
          </p>
          <p className="text-muted-foreground line-clamp-6 text-sm">
            {itinerary.dates
              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
              .toLocaleDateString()}
          </p>
          {itinerary.description ? <p>{itinerary.description}</p> : null}
        </div>
      </div>
    </Link>
  );
}
