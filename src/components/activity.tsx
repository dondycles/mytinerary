import { deleteActivity } from "@/lib/server/functions/acticvity";
import { Itinerary } from "@/lib/server/functions/itinerary";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlarmClockCheck, AlarmClockPlus, Pencil, Trash2 } from "lucide-react";
import { ActionConfirmationDialog } from "./action-confirmation-dialog";
import { Button } from "./ui/button";

export default function Activity({
  act,
  refetch,
  showActions,
}: {
  act: Itinerary["activitiesData"][0];
  refetch: () => void;
  showActions: boolean;
}) {
  const handleDeleteActivity = useMutation({
    mutationFn: async () => await deleteActivity({ data: { id: act.id } }),
    onSuccess: () => {
      refetch();
    },
  });
  return (
    <>
      <div
        key={act.id}
        className={`grid rounded-2xl ${showActions ? "bg-muted/50 grid-cols-[minmax(0px,116px)_1fr_minmax(0px,36px)] p-2" : "grid-cols-[minmax(0px,124px)_1fr]"} p-0 transition-all duration-300`}
      >
        <div className="grid grid-rows-3 gap-2">
          <div className="flex items-center gap-2">
            <AlarmClockPlus className="text-muted-foreground size-5" />
            <p>{format(act.startTime, "hh:mm aa")}</p>
          </div>
          <div className="ml-1.5 h-full w-1 border-l-8" />
          <div className="flex items-center gap-2">
            <AlarmClockCheck className="text-muted-foreground size-5" />
            <p>{format(act.endTime, "hh:mm aa")}</p>
          </div>
        </div>
        <div className="border-l border-dashed px-4">
          <p className="text-lg font-bold">{act.name}</p>
          <p className="text-muted-foreground text-sm">{act.description}</p>
        </div>
        {showActions ? (
          <div className="flex h-fit flex-col items-end gap-2 rounded-full">
            <Button
              type="button"
              size={"icon"}
              className="text-muted-foreground size-9 rounded-full"
              variant={"secondary"}
            >
              <Pencil />
            </Button>
            <ActionConfirmationDialog
              close={handleDeleteActivity.isSuccess}
              confirm={() => handleDeleteActivity.mutate()}
              description="Are you sure to delete this activity?"
              loading={handleDeleteActivity.isPending}
            >
              <Button
                type="button"
                size={"icon"}
                className="text-muted-foreground size-9 rounded-full"
                variant={"secondary"}
              >
                <Trash2 />
              </Button>
            </ActionConfirmationDialog>
          </div>
        ) : null}
      </div>
    </>
  );
}
