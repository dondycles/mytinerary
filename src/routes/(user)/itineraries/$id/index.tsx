import Activities from "@/components/activities";
import ItineraryForm from "@/components/itinerary-form";
import { Button } from "@/components/ui/button";
import { deepViewItineraryQueryOptions } from "@/lib/queries/itinerary";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { isSameDay } from "date-fns";
import { ChevronLeft, Pencil, Share2 } from "lucide-react";
export const Route = createFileRoute("/(user)/itineraries/$id/")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context, params }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
    await context.queryClient.ensureQueryData(
      deepViewItineraryQueryOptions(Number(params.id)),
    );
    return {
      user: context.user,
      id: Number(params.id),
      queryClient: context.queryClient,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useLoaderData();
  const route = useRouter();
  const itinerary = useSuspenseQuery(deepViewItineraryQueryOptions(id));
  const dates = itinerary.data.dates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const groupActivitiesByDate = () => {
    return dates.map((date) => ({
      data: itinerary.data.activitiesData.filter((act) =>
        isSameDay(new Date(act.startTime), date),
      ),
      date,
    }));
  };

  return (
    <div
      className="flex w-full px-4 py-20"
      key={itinerary.data.id + itinerary.data.updatedAt!.toISOString()}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="relative w-full">
          {itinerary.data.image ? (
            <img
              src={itinerary.data.image}
              className="aspect-video w-full rounded-md object-cover object-center"
            />
          ) : (
            <div className="bg-muted aspect-video w-full rounded-md"></div>
          )}

          <div className="absolute top-0 right-0 bottom-0 left-0 rounded-md"></div>
          <div className="absolute right-1/2 bottom-1/2 w-full translate-x-1/2 translate-y-1/2 p-4 text-center shadow-xl backdrop-blur-xs dark:backdrop-brightness-50">
            <p className="truncate text-2xl font-bold sm:text-4xl md:text-5xl">
              {itinerary.data.name}
            </p>
            <p className="line-clamp-6 text-sm">{itinerary.data.description}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-4">
          <Button
            variant={"secondary"}
            onClick={() => route.history.back()}
            size={"icon"}
          >
            <ChevronLeft />
          </Button>
          <div className="flex flex-row gap-2">
            <Button variant={"secondary"}>
              <Share2 />
            </Button>
            <ItineraryForm
              variant={"secondary"}
              isEditing
              refetch={itinerary.refetch}
              itineraryInitialData={itinerary.data}
              icon={<Pencil />}
            />
          </div>
        </div>
        {groupActivitiesByDate().map((act) => (
          <Activities
            itinerary={itinerary.data}
            key={act.date.toISOString()}
            date={act.date}
            activities={act.data}
            refetch={itinerary.refetch}
          />
        ))}
        {/* {Array.from({ length: dates.length }, (_, i) => (
          <Activities
            itinerary={itinerary.data}
            i={i}
            key={i}
            theseActivitiesDate={itinerary.data.dates[i]}
            activities={groupActivitiesByDate()}
          />
        ))} */}
      </div>
    </div>
  );
}
