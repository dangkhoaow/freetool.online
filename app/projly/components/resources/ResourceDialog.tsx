import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateResource, useUpdateResource } from "@/hooks/use-resources";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { resourceService } from "@/services/prisma/resources";
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
  
  const { mutate: createResource } = useCreateResource();
  const { mutate: updateResource } = useUpdateResource(resourceId);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "Equipment",
    quantity: 1,
    projectId: projectId
  });
  
  useEffect(() => {
    if (resourceId && resourceId !== "new") {
      fetchResource();
    } else {
      // Initialize with default values for new resource
      setFormData({
        name: "",
        type: "Equipment",
        quantity: 1,
        projectId: projectId
      });
    }
  }, [resourceId, projectId]);
  
  const fetchResource = async () => {
    if (!resourceId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await resourceService.getResourceById(resourceId);
        
      if (error) throw error;
      
      if (data) {
        setResource(data as unknown as Resource);
        setFormData({
          name: data.name || "",
          type: data.type || "Equipment",
          quantity: data.quantity || 1,
          projectId: projectId
        });
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
      toast({
        title: "Error",
        description: "Failed to load resource details",
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
    if (!formData.name.trim()) {
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
      projectId: projectId
    };

    if (isNewResource) {
      createResource(resourceData);
    } else if (resourceId) {
      updateResource(resourceData);
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
