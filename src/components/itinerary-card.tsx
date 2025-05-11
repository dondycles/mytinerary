import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteItinerary } from "@/lib/server/functions/itinerary";
import { itinerary as itineraryTypes } from "@/lib/server/schema";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { format } from "date-fns";
import { Ellipsis, ExternalLink, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function ItineraryCard({
  itinerary,
  refetch,
}: {
  itinerary: typeof itineraryTypes.$inferSelect;
  refetch: () => void;
}) {
  const route = useRouterState();
  const navigate = useNavigate();
  const orderedDates = itinerary.dates.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  const handleDeleteItinerary = useMutation({
    mutationFn: async (id: number) => await deleteItinerary({ data: id }),
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <Card
      onClick={() => navigate({ to: `/itineraries/${itinerary.id}` })}
      key={itinerary.id}
      className={`relative w-full max-w-2xl shrink-0 overflow-hidden ${handleDeleteItinerary.isPending && "pointer-events-none animate-pulse opacity-50"} ${route.isLoading ? "animate-pulse cursor-progress" : ""}`}
    >
      <div className="z-10 mr-4 flex flex-row items-start gap-4">
        <CardHeader className="flex-1">
          <CardTitle className="sm:text-2xl"> {itinerary.name}</CardTitle>
          {itinerary.description && (
            <CardDescription>{itinerary.description}</CardDescription>
          )}
        </CardHeader>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-full">
            <Ellipsis className="text-muted-foreground size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ExternalLink />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItinerary.mutate(itinerary.id);
              }}
              variant="destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="z-10">{`${format(orderedDates[orderedDates.length - 1], "LLL dd, y")} - ${format(orderedDates[0], "LLL dd, y")}`}</CardContent>
      {itinerary.image && (
        <img
          className="absolute top-1/2 left-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 dark:brightness-25"
          src={itinerary.image}
        />
      )}
    </Card>
  );
}
