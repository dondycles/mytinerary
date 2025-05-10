import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/radix/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const ActionConfirmationDialog = ({
  children,
  description,
  loading,
  confirm,
  close,
}: {
  children?: React.ReactNode;
  description: string;
  loading: boolean;
  confirm: () => void;
  close: boolean;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (close) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setOpen(false);
    }
  }, [close]);

  return (
    <Dialog onOpenChange={setOpen} open={open} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} type="button" variant="destructive">
            Cancel
          </Button>
          <Button disabled={loading} type="button" onClick={confirm}>
            {loading ? <Loader2 className="animate-spin" /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
