
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "./CreateTaskForm";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function CreateTaskButton() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  console.log("Device is mobile:", isMobile);
  
  const handleOpenChange = (open: boolean) => {
    console.log("Dialog/Drawer open state changed:", open);
    setOpen(open);
  };
  
  const handleSuccess = () => {
    console.log("Task creation successful, closing dialog/drawer");
    setOpen(false);
  };

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project. Fill out the form below to create a task.
            </DialogDescription>
          </DialogHeader>
          <CreateTaskForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>Create New Task</DrawerTitle>
          <DrawerDescription>
            Add a new task to your project. Fill out the form below to create a task.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <CreateTaskForm onSuccess={handleSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
