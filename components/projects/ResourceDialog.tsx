"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useCreateResource, useUpdateResource } from "@/lib/services/projly/use-resources";

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId?: string;
  projectId: string;
  resources?: any[]; // Add resources prop to avoid fetching again
}

export function ResourceDialog({ open, onOpenChange, resourceId, projectId, resources = [] }: ResourceDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Equipment");
  const [fileType, setFileType] = useState("Equipment");
  const [url, setUrl] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  // Use the hooks from use-resources.ts
  const createResourceMutation = useCreateResource();
  const updateResourceMutation = useUpdateResource(resourceId !== "new" ? resourceId : undefined);
  
  // Check if any mutation is loading
  const isLoading = createResourceMutation.isPending || updateResourceMutation.isPending;
  const [error, setError] = useState("");
  
  console.log("[ResourceDialog] Rendering with props:", { open, resourceId, projectId });

  useEffect(() => {
    console.log("[ResourceDialog] useEffect triggered with resourceId:", resourceId, "open:", open);
    if (!open) return;
    
    // Reset form when dialog opens for new resource
    if (!resourceId || resourceId === "new") {
      console.log("[ResourceDialog] Resetting form for new resource");
      setName("");
      setType("Equipment");
      setFileType("Equipment");
      setUrl("");
      setFilePath("");
      setFileSize(null);
      setQuantity(0);
      setError("");
      return;
    }
    
    // Find resource in the resources array instead of fetching from API
    console.log("[ResourceDialog] Looking for resource with ID:", resourceId, "in resources:", resources);
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource) {
      console.log("[ResourceDialog] Found resource in existing data:", resource);
      setName(resource.name || "");
      setType(resource.type || "Equipment");
      setFileType(resource.fileType || "Equipment");
      setUrl(resource.url || "");
      setFilePath(resource.filePath || "");
      setFileSize(resource.fileSize || null);
      setQuantity(resource.quantity ?? 0); // Use nullish coalescing to handle 0
      setError("");
    } else {
      console.error("[ResourceDialog] Resource not found in resources array");
      setError("Resource not found");
    }
  }, [resourceId, open, projectId, resources]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ResourceDialog] Submitting form");
    setError("");
    
    try {
      const resourceData = {
        name,
        fileType, // Use fileType as the primary field for consistency
        url: fileType === 'File' ? url : null,
        filePath: fileType === 'File' ? filePath : null,
        fileSize: fileType === 'File' ? fileSize : null,
        quantity,
        projectId
      };
      
      console.log("[ResourceDialog] Resource data to submit:", resourceData);
      
      if (resourceId && resourceId !== "new") {
        // Update existing resource using the hook
        console.log(`[ResourceDialog] Updating resource with ID ${resourceId} using useUpdateResource hook`);
        await updateResourceMutation.mutateAsync(resourceData);
      } else {
        // Create new resource using the hook
        console.log("[ResourceDialog] Creating new resource using useCreateResource hook");
        await createResourceMutation.mutateAsync(resourceData);
      }
      
      // Close the dialog
      onOpenChange(false);
      
      // Refresh the page to show updated resources
      window.location.reload();
    } catch (err) {
      console.error("[ResourceDialog] Error saving resource:", err);
      setError(err instanceof Error ? err.message : "Failed to save resource");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{resourceId && resourceId !== "new" ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
          <DialogDescription>
            {resourceId && resourceId !== "new" ? 'Update the resource details below.' : 'Add a new resource to this project.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4 text-red-800 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Resource Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Resource name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileType">Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
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
          </div>
          
          {fileType === 'File' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url">URL (Optional)</Label>
                <Input
                  id="url"
                  type="url"
                  value={url || ''}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Resource URL or link"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filePath">File Path (Optional)</Label>
                  <Input 
                    id="filePath"
                    type="text"
                    value={filePath || ''}
                    onChange={(e) => setFilePath(e.target.value)}
                    placeholder="Local or network path"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileSize">File Size (Optional)</Label>
                  <Input 
                    id="fileSize"
                    type="number"
                    value={fileSize || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log(`[ResourceDialog] FileSize input changed to: ${value}`);
                      setFileSize(value === '' ? null : Number(value));
                    }}
                    placeholder="Size in bytes"
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                console.log(`[ResourceDialog] Quantity input changed to: ${value}`);
                setQuantity(value === '' ? 0 : parseInt(value));
              }}
              placeholder="Enter quantity"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Resource'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
