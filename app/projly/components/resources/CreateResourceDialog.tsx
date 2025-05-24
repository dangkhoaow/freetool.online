import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjects } from "@/lib/services/projly/use-projects";
import { useCreateResource } from "@/lib/services/projly/use-resources";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { Plus } from "lucide-react";

const resourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fileType: z.string().min(1, "Type is required"),
  projectId: z.string().min(1, "Project is required"),
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
});

console.log(`[PROJLY:CREATE_RESOURCE_DIALOG] Updated resource schema to use 'fileType', file fields, and preprocess quantity`);

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface CreateResourceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateResourceDialog({ open, onClose }: CreateResourceDialogProps) {
  const { toast } = useToast();
  const { mutate: createResource, isPending } = useCreateResource();
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();

  // Get the first project ID if available for default selection
  const defaultProjectId = projectsData && projectsData.length > 0 ? projectsData[0].id : undefined;
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      fileType: "Equipment",
      url: null,
      filePath: null,
      fileSize: null,
      quantity: 0,
      projectId: defaultProjectId
    },
  });
  
  // Update form when projects are loaded
  useEffect(() => {
    if (projectsData && projectsData.length > 0 && !form.getValues().projectId) {
      form.setValue('projectId', projectsData[0].id);
      console.log(`[CREATE_RESOURCE_DIALOG] Set default projectId to ${projectsData[0].id}`);
    }
  }, [projectsData, form]);

  useEffect(() => {
    console.log('[CREATE_RESOURCE_DIALOG] Component mounted with initial values', form.getValues());
  }, []);

  const onSubmit = (values: ResourceFormValues) => {
    console.log(`[PROJLY:CREATE_RESOURCE_DIALOG] Form values before submission:`, values);
    createResource(
      {
        name: values.name,
        fileType: values.fileType,
        url: values.fileType === 'File' ? values.url : null,
        filePath: values.fileType === 'File' ? values.filePath : null,
        fileSize: values.fileType === 'File' ? values.fileSize : null,
        projectId: values.projectId,
        quantity: values.quantity,
      },
      {
        onSuccess: () => {
          toast({
            title: "Resource created",
            description: "The resource has been created successfully.",
          });
          form.reset();
          onClose();
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to create resource",
            description: error.message || "An error occurred while creating the resource.",
          });
        },
      }
    );
    console.log(`[PROJLY:CREATE_RESOURCE_DIALOG] Form submitted with values, including quantity`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
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
                              console.log(`[CREATE_RESOURCE_DIALOG] FileSize input changed to: ${value}`);
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
                        console.log(`[CREATE_RESOURCE_DIALOG] Quantity input changed to: ${value}, type: ${typeof value}`);
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
                  <FormLabel>Project <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(value) => {
                        console.log(`[CREATE_RESOURCE_DIALOG] Project selected: ${value}`);
                        field.onChange(value);
                      }} 
                      value={field.value || ''}>
                      <SelectTrigger className={!field.value ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingProjects ? (
                          <div className="flex justify-center p-2">
                            <PageLoading 
                              standalone={true} 
                              logContext="PROJLY:RESOURCES:CREATE:PROJECTS" 
                              height="5vh" 
                            />
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
                {isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                Create Resource
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
