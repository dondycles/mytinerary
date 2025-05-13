"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function MultipleDatePicker({
  className,
  setDates,
  dates,
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
              "flex h-fit w-full items-center-safe justify-start rounded-full text-left font-normal whitespace-break-spaces",
              !dates && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {dates ? (
              <p>
                {dates
                  .map((d) => format(d, "LLL dd, y"))
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .join(", ")}
              </p>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="multiple"
            defaultMonth={
              dates
                ? dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
                : new Date()
            }
            selected={dates}
            onSelect={setDates}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
