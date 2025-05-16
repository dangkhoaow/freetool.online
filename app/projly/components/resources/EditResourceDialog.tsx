import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjects } from "../../hooks/use-projects";
import { useUpdateResource } from "../../hooks/use-resources";
import { useToast } from "../../hooks/use-toast";
import { Resource } from "../../types/resources";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

const resourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.number().int().positive().min(1, "Quantity must be at least 1"),
  projectId: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface EditResourceDialogProps {
  resource: Resource;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditResourceDialog({ resource, onClose, onSuccess }: EditResourceDialogProps) {
  const { toast } = useToast();
  const { mutate: updateResource, isPending } = useUpdateResource(resource.id);
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      projectId: resource.projectId,
    },
  });

  useEffect(() => {
    form.reset({
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      projectId: resource.projectId,
    });
  }, [resource, form]);

  const onSubmit = (values: ResourceFormValues) => {
    updateResource(
      {
        name: values.name,
        type: values.type,
        quantity: values.quantity,
        projectId: values.projectId,
      },
      {
        onSuccess: () => {
          toast({
            title: "Resource updated",
            description: "The resource has been updated successfully.",
          });
          onSuccess();
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to update resource",
            description: error.message || "An error occurred while updating the resource.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Resource name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="License">License</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      min={1} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (Optional)</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || "unassigned"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Not Assigned</SelectItem>
                        {isLoadingProjects ? (
                          <div className="flex justify-center p-2">
                            <Spinner className="h-4 w-4" />
                          </div>
                        ) : (
                          projectsData?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Update Resource
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
