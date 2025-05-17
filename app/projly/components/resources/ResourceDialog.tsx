import { useState, useEffect, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useCreateResource, useUpdateResource } from "@/lib/services/projly/use-resources";
import { toast } from "../../components/ui/use-toast";
import { Spinner } from "../../components/ui/spinner";
import apiClient from "@/lib/api-client";
import { Resource } from "@/lib/services/projly/types";
import { CreateResourceParams, UpdateResourceParams } from "@/lib/services/projly/use-resources";  // Import params types for type safety

interface ResourceDialogProps {
  projectId: string;
  resourceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormDataType {
  name: string;
  fileType: string;
  url?: string | null;
  fileSize?: number | null;
  filePath?: string | null;
  quantity: number | null | undefined;
  projectId: string;
}

export function ResourceDialog({ projectId, resourceId, open, onOpenChange }: ResourceDialogProps) {
  const isNewResource = !resourceId;
  const title = isNewResource ? "Create Resource" : "Edit Resource";
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { mutate: createResource } = useCreateResource();
  const { mutate: updateResource } = useUpdateResource(resourceId);
  
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    fileType: "Equipment",
    url: null,
    fileSize: null,
    filePath: null,
    quantity: undefined,
    projectId: projectId
  });
  
  useEffect(() => {
    if (resourceId && resourceId !== "new") {
      fetchResource();
    } else {
      // Initialize with default values for new resource
      setFormData({
        name: "",
        fileType: "Equipment",
        url: null,
        fileSize: null,
        filePath: null,
        quantity: undefined,
        projectId: projectId
      });
      console.log(`[ResourceDialog] Initialized form data for new resource:`, { name: "", fileType: "Equipment", url: null, fileSize: null, filePath: null, quantity: undefined, projectId });
    }
  }, [resourceId, projectId]);
  
  // Log available dropdown options for debugging
  useEffect(() => {
    console.log('[ResourceDialog] Available SelectItem values: Equipment, Material, Software, Human, File, Other');
  }, []);
  
  const fetchResource = async () => {
    if (!resourceId) return;
    
    setIsLoading(true);
    try {
      console.log(`[ResourceDialog] Fetching resource with ID: ${resourceId}`);
      const response = await apiClient.get(`api/projly/resources/${resourceId}`);
      if (response.error) throw response.error;
      const data = response.data as Resource;
      setResource(data);
      const newFormData: FormDataType = {
        name: data.name || "",
        fileType: data.fileType || "Equipment",
        url: data.url,
        fileSize: data.fileSize,
        filePath: data.filePath,
        quantity: data.quantity,  // Can be null or number
        projectId: projectId
      };
      setFormData(newFormData);
      console.log(`[ResourceDialog] Fetched and set form data:`, newFormData);
    } catch (error: any) {
      console.error("[ResourceDialog] Error fetching resource:", error);
      toast({
        title: "Error",
        description: "Failed to load resource details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`[ResourceDialog] Received change for field '${field}' with value: ${value}`);
    let newValue: any;
    if (field === 'quantity' || field === 'fileSize') {
      const numValue = parseFloat(value);
      newValue = isNaN(numValue) ? null : numValue;
      console.log(`[ResourceDialog] Parsed numeric value for ${field}: ${newValue}`);
    } else {
      newValue = value === '' ? null : value;
    }
    const newFormData = { ...formData, [field]: newValue as any };  // Type assertion for safety during state update
    console.log(`[ResourceDialog] New form data after change:`, newFormData);
    setFormData(newFormData);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ 
        title: "Error", 
        description: "Resource name is required",
        variant: "destructive" 
      });
      return;
    }

    if (isNewResource) {
      const createData: CreateResourceParams = {
        name: formData.name,
        fileType: formData.fileType,
        url: formData.url,
        fileSize: formData.fileSize,
        filePath: formData.filePath,
        quantity: formData.quantity,
        projectId: projectId
      };
      console.log("[ResourceDialog] Creating new resource with data:", createData);
      createResource(createData);
    } else if (resourceId) {
      const updateData = {
        name: formData.name,
        fileType: formData.fileType,
        url: formData.url,
        fileSize: formData.fileSize,
        filePath: formData.filePath,
        quantity: formData.quantity,
        projectId: projectId
      };
      console.log("[ResourceDialog] Updating existing resource with data:", updateData);
      updateResource(updateData as UpdateResourceParams);
      console.log("[ResourceDialog] Submitted update data types:", {
        name: typeof updateData.name,
        fileType: typeof updateData.fileType,
        url: typeof updateData.url,
        fileSize: typeof updateData.fileSize,
        filePath: typeof updateData.filePath,
        quantity: typeof updateData.quantity,
        projectId: typeof updateData.projectId
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fileType">Type</Label>
                <Select 
                  value={formData.fileType} 
                  onValueChange={(value) => {
                    handleChange("fileType", value);
                    console.log(`[ResourceDialog] File type changed to '${value}', updating field visibility logic.`);
                  }}
                >
                  <SelectTrigger id="fileType">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Human">Human</SelectItem>
                    <SelectItem value="File">File</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.fileType === 'File' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL (Optional)</Label>
                    <Input
                      id="url"
                      value={formData.url || ''}
                      onChange={(e) => handleChange("url", e.target.value)}
                      placeholder="Resource URL or link"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="filePath">File Path (Optional)</Label>
                      <Input
                        id="filePath"
                        value={formData.filePath || ''}
                        onChange={(e) => handleChange("filePath", e.target.value)}
                        placeholder="Local or network path"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="fileSize">File Size (Optional)</Label>
                      <Input
                        id="fileSize"
                        type="number"
                        min="0"
                        value={typeof formData.fileSize === 'number' ? formData.fileSize : ''}
                        onChange={(e) => handleChange("fileSize", e.target.value)}
                        placeholder="Size in bytes"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={typeof formData.quantity === 'number' ? formData.quantity : (formData.quantity === null ? '0' : '') as any}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isNewResource ? 'Create' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
