import { Itinerary } from "@/lib/server/functions/itinerary";
import { format } from "date-fns";
import { ChevronUp, Pencil, PencilOff } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Activity from "./activity";
import AddActivityCollapsible from "./add-activity-collapsible";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./animate-ui/radix/collapsible";
import { Button } from "./ui/button";

export default function Activities({
  itinerary,
  activities,
  date,
  refetch,
}: {
  itinerary: Itinerary;
  activities: Itinerary["activitiesData"];
  date: Date;
  refetch: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [collapse, setCollapse] = useState(true);

  return (
    <Collapsible
      open={collapse && activities.length !== 0}
      onOpenChange={(collapse) => {
        setCollapse(collapse);
        if (!collapse) {
          if (!isEditing) return;
          setIsEditing(false);
        }
      }}
    >
      <div className="bg-muted/25 rounded-md p-4">
        <CollapsibleTrigger asChild>
          <div
            className={`text-muted-foreground ${collapse ? "mb-4" : ""} flex items-center justify-between gap-4`}
          >
            <p className="text-sm">{format(date, "LLL dd, y")}</p>
            <div className="just flex items-center justify-center gap-2">
              <Button
                variant={"secondary"}
                size={"icon"}
                hidden={activities.length === 0}
                className={`text-muted-foreground flex items-center justify-center rounded-full ${collapse ? "opacity-100" : "pointer-events-none opacity-0"} transition-all duration-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapse(true);
                  setIsEditing((prev) => !prev);
                }}
                type="button"
              >
                {isEditing ? (
                  <PencilOff className="size-4" />
                ) : (
                  <Pencil className="size-4" />
                )}
              </Button>
              {activities.length === 0 ? null : (
                <Button
                  variant={"secondary"}
                  size={"icon"}
                  className="text-muted-foreground flex items-center justify-center rounded-full"
                >
                  <ChevronUp
                    className={`size-5 transition-all ${collapse ? "rotate-0" : "-rotate-180"}`}
                  />
                </Button>
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        {activities.length === 0 ? (
          <AddActivityCollapsible date={date} itinerary={itinerary} />
        ) : (
          <CollapsibleContent>
            <div
              className={`"flex h-full flex-col space-y-4 ${isEditing ? "divide-y-0 divide-none" : "divide-y-1 divide-dashed"}" transition-all duration-300`}
            >
              {activities.map((act, i) => (
                // activities have different days
                // so we make sure that each days only get the activities inserted to that day
                <div className={`${!isEditing && "not-last:pb-4"}`} key={act.id}>
                  <Activity
                    act={act}
                    key={act.id}
                    showActions={isEditing}
                    refetch={refetch}
                  />
                  <motion.div
                    key={act.id}
                    layout
                    initial={{ height: 0 }}
                    animate={{
                      opacity: isEditing ? 1 : 0,
                      height: isEditing ? "auto" : 0,
                      overflow: "hidden",
                      marginTop: isEditing ? 16 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 22 }}
                  >
                    <AddActivityCollapsible
                      prevActEndTime={act.endTime}
                      nextActStartTime={
                        !activities[i + 1] ? null : activities[i + 1].startTime
                      }
                      date={date}
                      itinerary={itinerary}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
