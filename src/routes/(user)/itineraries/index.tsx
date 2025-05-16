import ItineraryCard from "@/components/itinerary-card";
import ItineraryForm from "@/components/itinerary-form";
import { getItinerariesQueryOptions } from "@/lib/queries/itinerary";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus } from "lucide-react";
export const Route = createFileRoute("/(user)/itineraries/")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
    await context.queryClient.ensureQueryData(
      getItinerariesQueryOptions(context.user.id),
    );
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useLoaderData();
  const itineraries = useSuspenseQuery(getItinerariesQueryOptions(user.id));
  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 py-20">
      <ItineraryForm
        icon={<Plus />}
        className="fixed right-1/2 bottom-4 size-12 translate-x-1/2 rounded-full"
        isEditing={false}
        refetch={itineraries.refetch}
      />
      {itineraries.data.length !== 0 ? (
        itineraries.data.map((itinerary) => (
          <ItineraryCard key={itinerary.id} itinerary={itinerary} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">
          Start adding your very first itinerary by clicking the floating "+" buttong
          below.
        </p>
      )}
    </div>
  );
}
