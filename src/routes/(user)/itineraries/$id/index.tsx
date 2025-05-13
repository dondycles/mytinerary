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
import ItineraryCard from "@/components/itinerary-card";
import ItineraryForm from "@/components/itinerary-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deepViewItineraryQueryOptions } from "@/lib/queries/itinerary";
import { changeItineraryPrivacy } from "@/lib/server/functions/itinerary";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { isSameDay } from "date-fns";
import { ChevronLeft, Lock, Pencil, Users2 } from "lucide-react";
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

  const handleChangeItineraryPrivacy = useMutation({
    mutationFn: async (privacy: "private" | "collaborative") =>
      await changeItineraryPrivacy({ data: { id, privacy } }),
    onSuccess: () => {
      itinerary.refetch();
    },
  });

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
                  {itinerary.data.privacy === "private" ? <Lock /> : <Users2 />}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl p-4">
                <DialogHeader>
                  <DialogTitle>Privacy</DialogTitle>
                  <DialogDescription>
                    Please be mindful when sharing your itinerary.
                  </DialogDescription>
                </DialogHeader>
                <RadioGroup
                  disabled={
                    handleChangeItineraryPrivacy.isPending || !itinerary.isFetched
                  }
                  value={itinerary.data.privacy}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      onClick={() => handleChangeItineraryPrivacy.mutate("private")}
                      value="private"
                      id="r1"
                    />
                    <Label htmlFor="r1">Private</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      onClick={() => handleChangeItineraryPrivacy.mutate("collaborative")}
                      value="collaborative"
                      id="r2"
                    />
                    <Label htmlFor="r2">Collaborative</Label>
                  </div>
                </RadioGroup>

                {itinerary.data.privacy === "collaborative" ? (
                  <div className="flex flex-col gap-2">
                    {itinerary.data.peopleData.map((p) => (
                      <p key={p.id} className="text-muted-foreground text-sm">
                        {p.email}
                      </p>
                    ))}
                    <div className="flex w-full flex-1 items-center gap-2">
                      <Input
                        disabled
                        placeholder={itinerary.data.collabId}
                        value={itinerary.data.collabId}
                        className="flex-1 rounded-full"
                      />
                      <CopyButton
                        variant={"ghost"}
                        content={itinerary.data.collabId}
                        size="default"
                      />
                    </div>
                  </div>
                ) : null}
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
        <ItineraryCard itinerary={itinerary.data} />
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
