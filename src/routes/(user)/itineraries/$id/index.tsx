import Activities from "@/components/activities";
import { CopyButton } from "@/components/animate-ui/buttons/copy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/radix/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/animate-ui/radix/radio-group";
import ItineraryForm from "@/components/itinerary-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const shareCode = crypto.randomUUID();
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
        <div className="text-muted-foreground flex flex-row justify-between gap-4">
          <Button
            variant={"ghost"}
            onClick={() => route.history.back()}
            size={"icon"}
            className="rounded-full"
          >
            <ChevronLeft />
          </Button>
          <div className="flex flex-row gap-2">
            <Dialog modal>
              <DialogTrigger asChild>
                <Button size={"icon"} variant={"ghost"} className="rounded-full">
                  <Share2 />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl p-4">
                <DialogHeader>
                  <DialogTitle>Share</DialogTitle>
                  <DialogDescription>
                    Let your friends see or edit this itinerary.
                  </DialogDescription>
                </DialogHeader>
                <RadioGroup defaultValue="default">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="r1" />
                    <Label htmlFor="r1">View Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <Label htmlFor="r2">View and Edit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="r3" />
                    <Label htmlFor="r3">View, Edit, and Share</Label>
                  </div>
                </RadioGroup>
                <div className="flex w-full flex-1 items-center gap-2">
                  <Input
                    placeholder={shareCode}
                    value={shareCode}
                    className="flex-1 rounded-full"
                  />
                  <CopyButton variant={"ghost"} content={shareCode} size="default" />
                </div>
              </DialogContent>
            </Dialog>

            <ItineraryForm
              variant={"ghost"}
              isEditing
              refetch={itinerary.refetch}
              itineraryInitialData={itinerary.data}
              icon={<Pencil />}
              className="rounded-full"
            />
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border p-4">
          {itinerary.data.image ? (
            <img
              src={itinerary.data.image}
              className="aspect-video w-full rounded-2xl object-cover object-center"
            />
          ) : null}
          <div>
            <p className="truncate text-2xl font-bold sm:text-4xl md:text-5xl">
              {itinerary.data.name}
            </p>
            <p className="text-muted-foreground line-clamp-6 text-sm">
              {itinerary.data.dates
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
                .toLocaleDateString()}
            </p>
            {itinerary.data.description ? (
              <p className="mt-2">{itinerary.data.description}</p>
            ) : null}
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
