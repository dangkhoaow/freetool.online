
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResources, useCreateResource, useUpdateResource } from "@/hooks/use-resources";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Resource } from "@/types/resources";

interface ResourceDialogProps {
  projectId: string;
  resourceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResourceDialog({ projectId, resourceId, open, onOpenChange }: ResourceDialogProps) {
  const isNewResource = !resourceId;
  const title = isNewResource ? "Create Resource" : "Edit Resource";
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get resources from the hook to find the resource by ID
  const { data: resourcesData, isLoading: resourcesLoading } = useResources();
  const { mutate: createResource } = useCreateResource();
  const { mutate: updateResource } = useUpdateResource(resourceId);
  
  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    name: "",
    type: "Equipment",
    quantity: 1,
    projectId: projectId
  });
  
  console.log("[ResourceDialog] Initial render with resourceId:", resourceId, "and open:", open);
  
  // Fix for the resource name not showing in edit dialog
  // This key will force the component to re-render with fresh state when resourceId changes
  const dialogKey = resourceId || 'new-resource';
  
  // Debug log when component mounts/updates
  useEffect(() => {
    console.log("[ResourceDialog] Component rendered with:", { resourceId, projectId, open, dialogKey });
    console.log("[ResourceDialog] Current formData:", formData);
    console.log("[ResourceDialog] Current resource state:", resource);
  });

  // This effect runs when the dialog opens/closes or when resourceId changes
  useEffect(() => {
    // Load resource data when the dialog opens and resourceId changes
    if (open && resourceId && !resourcesLoading) {
      fetchResource();
    }
  }, [open, resourceId, resourcesLoading, resourcesData]);

  useEffect(() => {
    // Reset state when dialog closes
    if (!open) {
      console.log("[ResourceDialog] Dialog closed, resetting state");
      setResource(null);
      setFormData({
        name: "",
        type: "Equipment",
        quantity: 1,
        projectId: projectId
      });
    } else if (open) {
      // Dialog is open
      if (resourceId && resourceId !== "new") {
        // Editing existing resource - fetch data
        console.log("[ResourceDialog] Dialog opened for existing resource, fetching data for ID:", resourceId);
        fetchResource();
      } else {
        // Creating new resource - reset form
        console.log("[ResourceDialog] Dialog opened for new resource");
        setResource(null);
        setFormData({
          name: "",
          type: "Equipment",
          quantity: 1,
          projectId: projectId
        });
      }
    }
  }, [open, resourceId, projectId]);

  // This effect updates formData whenever the resource data changes
  // This is critical for ensuring the form fields are populated with the resource data
  useEffect(() => {
    if (resource) {
      console.log("[ResourceDialog] Resource data loaded:", resource);
      // Explicitly extract and log each field for debugging
      const resourceName = resource.name || "";
      const resourceType = resource.type || "Equipment";
      const resourceQuantity = resource.quantity || 1;
      
      console.log("[ResourceDialog] Extracted field values:", {
        name: resourceName,
        type: resourceType,
        quantity: resourceQuantity
      });
      
      // Update form data with resource values
      setFormData({
        name: resourceName,
        type: resourceType,
        quantity: resourceQuantity,
        projectId: projectId
      });
    }
  }, [resource, projectId]);

  const fetchResource = () => {
    if (!resourceId) {
      console.log("[ResourceDialog] fetchResource: No resourceId provided");
      return;
    }
    
    console.log(`[ResourceDialog] fetchResource: Finding resource with ID: ${resourceId} in local data`);
    setIsLoading(true);
    
    try {
      // Find the resource in the resources data
      const resources = Array.isArray(resourcesData?.data) ? resourcesData.data : [];
      console.log("[ResourceDialog] fetchResource: Available resources:", resources);
      const resourceData = resources.find((r: Resource) => r.id === resourceId);
      console.log("[ResourceDialog] fetchResource: Found resource:", resourceData);
      
      if (resourceData) {
        console.log("[ResourceDialog] fetchResource: Resource data:", resourceData);
        console.log("[ResourceDialog] fetchResource: Resource name:", resourceData.name);
        console.log("[ResourceDialog] fetchResource: Resource type:", resourceData.type);
        console.log("[ResourceDialog] fetchResource: Resource quantity:", resourceData.quantity);
        
        // Set both resource and formData
        setResource(resourceData);
        
        // Create new form data object with resource values
        const newFormData = {
          name: resourceData.name || "",
          type: resourceData.type || "Equipment",
          quantity: resourceData.quantity || 1,
          projectId: projectId
        };
        
        console.log("[ResourceDialog] fetchResource: Setting form data:", newFormData);
      
        // Update form data state
        setFormData(newFormData);
      } else {
        console.log("[ResourceDialog] fetchResource: Resource not found in local data");
        toast({
          title: "Resource Not Found",
          description: "The requested resource could not be found",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("[ResourceDialog] fetchResource: Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load resource details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log("[ResourceDialog] Submit button clicked with formData:", formData);
    
    if (!formData.name.trim()) {
      console.log("[ResourceDialog] Form validation failed: name is required");
      toast({ 
        title: "Error", 
        description: "Resource name is required",
        variant: "destructive" 
      });
      return;
    }

    const resourceData = {
      name: formData.name,
      type: formData.type,
      quantity: Number(formData.quantity),
      project_id: projectId
    };
    
    console.log("[ResourceDialog] Prepared resource data for submission:", resourceData);

    // Use the mutation functions which handle authentication internally
    if (isNewResource) {
      console.log("[ResourceDialog] Creating new resource");
      createResource(resourceData);
    } else if (resourceId) {
      console.log(`[ResourceDialog] Updating resource with ID: ${resourceId}`);
      updateResource(resourceData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog key={dialogKey} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Human">Human</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {isNewResource ? "Create Resource" : "Save Changes"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
