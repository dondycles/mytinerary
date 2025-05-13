import { zodResolver } from "@hookform/resolvers/zod";
import { format, getHours, setHours } from "date-fns";
import { Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Itinerary } from "@/lib/server/functions/itinerary";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const FormSchema = z.object({
  time: z.date({
    required_error: "A date and time is required.",
  }),
});

export function DateTimePickerForm({
  date,
  setTime,
  label,
  startTime,
  prevActEndTime,
  nextActStartTime,
}: {
  date: Date;
  setTime: (time: Date) => void;
  label: string;
  startTime?: Date;
  prevActEndTime?: Itinerary["activitiesData"][0]["endTime"] | undefined | null;
  nextActStartTime?: Itinerary["activitiesData"][0]["startTime"] | undefined | null;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const newDate = date;
    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(hour);
      if (!startTime) {
        if (prevActEndTime) {
          if (parseInt(value, 10) === prevActEndTime.getHours())
            newDate.setMinutes(prevActEndTime.getMinutes() + 1);
        }
      } else {
        if (startTime.getHours() === parseInt(value, 10)) {
          newDate.setMinutes(startTime.getMinutes() + 1);
        } else if (nextActStartTime)
          newDate.setMinutes(nextActStartTime.getMinutes() - 1);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    }

    form.setValue("time", newDate);
    setTime(newDate);
  }

  useEffect(() => {
    if (startTime) {
      if (getHours(startTime) >= getHours(form.getValues("time"))) form.reset();
    }
  }, [form, startTime]);

  return (
    <Form {...form}>
      <form className="space-y-5">
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{label} (12h)</FormLabel>

              <Popover modal>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant={"outline"}
                      className={cn(
                        "w-full rounded-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "hh:mm aa")
                      ) : (
                        <span>hh:mm aa</span>
                      )}

                      <Clock className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="sm:flex">
                    <div className="flex flex-col divide-y sm:h-[200px] sm:flex-row sm:divide-x sm:divide-y-0">
                      <ScrollArea className="w-fit">
                        <div className="flex p-2 sm:flex-col">
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <Button
                              hidden={
                                (startTime
                                  ? getHours(startTime) > getHours(setHours(date, hour))
                                  : false) ||
                                (prevActEndTime
                                  ? prevActEndTime.getHours() > hour
                                  : false) ||
                                (nextActStartTime
                                  ? nextActStartTime.getHours() < hour
                                  : false)
                              }
                              type="button"
                              key={hour}
                              // size="icon"
                              variant={
                                field.value && field.value.getHours() === hour
                                  ? "default"
                                  : "ghost"
                              }
                              className="shrink-0 sm:w-full"
                              onClick={() => handleTimeChange("hour", hour.toString())}
                            >
                              {hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}
                              {hour > 12 ? (hour === 24 ? " AM" : " PM") : " AM"}
                            </Button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                      </ScrollArea>
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex p-2 sm:flex-col">
                          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                            <Button
                              type="button"
                              key={minute}
                              size="icon"
                              variant={
                                field.value && field.value.getMinutes() === minute
                                  ? "default"
                                  : "ghost"
                              }
                              disabled={!form.watch("time")}
                              hidden={
                                !startTime
                                  ? (prevActEndTime
                                      ? prevActEndTime.getHours() === date.getHours()
                                        ? prevActEndTime.getMinutes() >= minute
                                        : false
                                      : false) ||
                                    (nextActStartTime
                                      ? nextActStartTime.getHours() === date.getHours()
                                        ? nextActStartTime.getMinutes() <= minute
                                        : false
                                      : false)
                                  : (nextActStartTime
                                      ? nextActStartTime.getHours() === date.getHours()
                                        ? nextActStartTime.getMinutes() <= minute
                                        : false
                                      : false) ||
                                    (startTime.getHours() === date.getHours()
                                      ? startTime.getMinutes() >= minute
                                      : false)
                              }
                              className="aspect-square shrink-0 sm:w-full"
                              onClick={() =>
                                handleTimeChange("minute", minute.toString())
                              }
                            >
                              {minute.toString().padStart(2, "0")}
                            </Button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                      </ScrollArea>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
