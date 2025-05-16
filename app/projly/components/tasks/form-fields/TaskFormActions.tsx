
import React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface TaskFormActionsProps {
  isPending: boolean;
}

export function TaskFormActions({ isPending }: TaskFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <DialogClose asChild>
        <Button type="button" variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
}
