import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjects } from "@/lib/services/projly/use-projects";
import { useUpdateResource } from "@/lib/services/projly/use-resources";
import { useToast } from "@/components/ui/use-toast";
import { Resource } from "@/lib/services/projly/types";
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
  fileType: z.string().min(1, "File Type is required"),
  url: z.string().nullable().optional(),
  filePath: z.string().nullable().optional(),
  fileSize: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
    z.number().nullable().optional()
  ),
  quantity: z.preprocess(
    // Convert string to number if possible, otherwise return the original value
    (val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
    z.number().min(0, "Quantity must be non-negative").optional()
  ),
  projectId: z.string().optional(),
});

console.log(`[EDIT_RESOURCE_DIALOG] Updated resource schema to include file fields and preprocess quantity`);

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
      fileType: resource.fileType || "Equipment",
      url: resource.url,
      filePath: resource.filePath,
      fileSize: resource.fileSize,
      quantity: resource.quantity ?? 0, // Initialize with 0 to prevent uncontrolled/controlled switch
      projectId: resource.projectId,
    },
  });
  
  console.log(`[EDIT_RESOURCE_DIALOG] Initialized form with defaultValues:`, {
    name: resource.name,
    fileType: resource.fileType || "Equipment",
    url: resource.url,
    filePath: resource.filePath,
    fileSize: resource.fileSize,
    quantity: resource.quantity ?? 0,
    projectId: resource.projectId
  });

  useEffect(() => {
    const resetValues = {
      name: resource.name,
      fileType: resource.fileType || "Equipment",
      url: resource.url,
      filePath: resource.filePath,
      fileSize: resource.fileSize,
      quantity: resource.quantity ?? 0, // Initialize with 0 to prevent uncontrolled/controlled switch
      projectId: resource.projectId,
    };
    form.reset(resetValues);
    console.log(`[EDIT_RESOURCE_DIALOG] Reset form with values:`, resetValues);
  }, [resource, form]);

  const onSubmit = (values: ResourceFormValues) => {
    console.log(`[EDIT_RESOURCE_DIALOG] Form values before submission:`, values);
    updateResource(
      {
        name: values.name,
        fileType: values.fileType,
        url: values.fileType === 'File' ? values.url : null,
        filePath: values.fileType === 'File' ? values.filePath : null,
        fileSize: values.fileType === 'File' ? values.fileSize : null,
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
              name="fileType"
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
                        <SelectItem value="File">File</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('fileType') === 'File' && (
              <>
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="Resource URL or link" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filePath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Path (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="Local or network path" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fileSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Size (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              console.log(`[EDIT_RESOURCE_DIALOG] FileSize input changed to: ${value}`);
                              field.onChange(value === '' ? null : Number(value));
                            }}
                            placeholder="Size in bytes" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
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
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log(`[EDIT_RESOURCE_DIALOG] Quantity input changed to: ${value}, type: ${typeof value}`);
                        field.onChange(value === '' ? undefined : Number(value));
                      }}
                      placeholder="Enter quantity" 
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
