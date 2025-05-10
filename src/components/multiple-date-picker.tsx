"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function MultipleDatePicker({
  className,
  dates,
  setDates,
}: React.HTMLAttributes<HTMLDivElement> & {
  setDates: (dates: Date[] | undefined) => void;
  dates: Date[] | undefined;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dates && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {format(dates![0], "LLL dd, y")} - {format(dates!.reverse()[0], "LLL dd, y")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="multiple"
            selected={dates}
            onSelect={setDates}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
