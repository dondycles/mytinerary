import {
  InputButton,
  InputButtonAction,
  InputButtonInput,
  InputButtonProvider,
  InputButtonSubmit,
} from "@/components/animate-ui/buttons/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/radix/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  addItinerary,
  editItinerary,
  findCollaborationId,
  itinerarySchema,
} from "@/lib/server/functions/itinerary";
import { itinerary } from "@/lib/server/schema";
import { cn, handleImageChange } from "@/lib/utils";
import { ItinerarySchema } from "@/lib/zod/itinerary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActionConfirmationDialog } from "./action-confirmation-dialog";
import { MultipleDatePicker } from "./date-picker-w-range";
import ImageInput from "./image-input";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
export default function ItineraryForm({
  refetch,
  itineraryInitialData,
  isEditing = false,
  variant = "default",
  icon,
  className,
}: {
  refetch: () => void;
  itineraryInitialData?: typeof itinerary.$inferSelect;
  isEditing: boolean;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  icon: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [collabId, setCollabId] = useState<string>();
  const form = useForm<ItinerarySchema>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      name: itineraryInitialData?.name,
      description: itineraryInitialData?.description ?? "",
      image: itineraryInitialData?.image ?? "",
      dates: itineraryInitialData?.dates ?? undefined,
    },
  });

  const handleAddItinerary = useMutation({
    mutationFn: async (data: ItinerarySchema) => {
      if (isEditing) {
        if (itineraryInitialData)
          await editItinerary({
            data: {
              ...data,
              id: itineraryInitialData.id,
              pastDates: itineraryInitialData.dates,
            },
          });
      } else {
        await addItinerary({ data });
      }
    },
    onSuccess: () => {
      form.reset();
      refetch();
      setOpen(false);
    },
  });

  const handleFindCollabId = useMutation({
    mutationFn: async () => await findCollaborationId({ data: collabId as string }),
    onSuccess: () => {
      form.reset();
      refetch();
      setOpen(false);
    },
  });

  const isSubmitting = form.formState.isSubmitting || handleAddItinerary.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={"icon"} className={cn("", className)}>
          {handleFindCollabId.isPending || handleAddItinerary.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            icon
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-dvh w-full max-w-sm rounded-3xl p-4"
      >
        <DialogHeader>
          <DialogTitle>
            {itineraryInitialData ? "Update Itinerary" : "New Itinerary"}
          </DialogTitle>
          <DialogDescription>
            {itineraryInitialData
              ? `Last update: ${itineraryInitialData.updatedAt?.toLocaleString()}`
              : "Create a new itinerary by filling out the form below."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => handleAddItinerary.mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <ImageInput
                    imgUri={field.value}
                    onChange={(e) => {
                      field.onChange();
                      handleImageChange({
                        e,
                        setValue: (res: string) => form.setValue("image", res),
                      });
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input className="rounded-full" placeholder="Boracay" {...field} />
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
                    <Textarea className="rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dates</FormLabel>
                  <FormControl>
                    <MultipleDatePicker
                      dates={form.watch("dates")}
                      setDates={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-2 sm:flex-col">
              {itineraryInitialData ? (
                <ActionConfirmationDialog
                  description="Are you sure with these changes?"
                  loading={isSubmitting}
                  confirm={form.handleSubmit((data) => handleAddItinerary.mutate(data))}
                  close={handleAddItinerary.isPending}
                >
                  <Button
                    type="button"
                    disabled={isSubmitting || !form.formState.isDirty}
                    className="w-full rounded-full"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Update"}
                  </Button>
                </ActionConfirmationDialog>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isDirty}
                  className="w-full rounded-full"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Create"}
                </Button>
              )}

              <Button
                type="button"
                variant={"destructive"}
                disabled={isSubmitting}
                className="w-full rounded-full"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_32px_1fr]">
              <Separator className="my-auto" />
              <p className="text-muted-foreground text-center text-sm">or</p>
              <Separator className="my-auto" />
            </div>
            <InputButtonProvider className="w-full" id="collabCode">
              <InputButton className="w-full">
                <InputButtonAction className="w-full">
                  Enter Collaboration Code
                </InputButtonAction>
                <InputButtonSubmit onClick={() => handleFindCollabId.mutate()}>
                  Submit
                </InputButtonSubmit>
              </InputButton>
              <InputButtonInput
                type="text"
                value={collabId}
                onChange={(e) => setCollabId(e.target.value)}
                disabled={handleFindCollabId.isPending}
              />
            </InputButtonProvider>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
