import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/radix/collapsible";
import { activitySchema, addActivity } from "@/lib/server/functions/acticvity";
import { Itinerary } from "@/lib/server/functions/itinerary";
import { ActivitySchema } from "@/lib/zod/activcity";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DateTimePickerForm } from "./date-time-picker";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
export default function AddActivityCollapsible({
  itinerary,
  date,
  prevActEndTime,
  nextActStartTime,
}: {
  itinerary: Itinerary;
  date: Date;
  prevActEndTime?: Itinerary["activitiesData"][0]["endTime"] | undefined | null;
  nextActStartTime?: Itinerary["activitiesData"][0]["startTime"] | undefined | null;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useForm<ActivitySchema>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      startDate: undefined,
      description: "",
      endDate: undefined,
      name: "",
    },
  });
  const handleAddActivity = useMutation({
    mutationFn: async (data: ActivitySchema) =>
      await addActivity({ data: { ...data, itineraryId: itinerary.id, date } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["itinerary", itinerary.id],
      });
      form.reset();
      setOpen(false);
    },
  });

  const isSubmitting = form.formState.isSubmitting || handleAddActivity.isPending;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex-1">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground flex w-full gap-4">
          <div className="border-muted h-px flex-1 border-t-2 border-dashed" />
          <Plus className="text-muted-foreground" />
          <div className="border-muted h-px flex-1 border-t-2 border-dashed" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <div className="grid grid-cols-[minmax(0px,112px)_1fr] gap-4 pt-4">
          <div className="flex flex-col gap-4">
            <DateTimePickerForm
              key="start"
              label="Start Time"
              startTime={undefined}
              date={date}
              setTime={(date) => {
                form.setValue("startDate", date);
              }}
              nextActStartTime={nextActStartTime}
              prevActEndTime={prevActEndTime}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <DateTimePickerForm
                  key="end"
                  label="End Time"
                  startTime={field.value}
                  date={date}
                  setTime={(date) => {
                    form.setValue("endDate", date);
                    console.log("Set End: ", date);
                  }}
                  nextActStartTime={nextActStartTime}
                  prevActEndTime={prevActEndTime}
                />
              )}
            />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => handleAddActivity.mutate(data))}
              className="flex-1 space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descriptions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Add"}
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    form.reset();
                    setOpen(false);
                  }}
                  variant={"destructive"}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
