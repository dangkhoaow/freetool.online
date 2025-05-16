
import { useState, useEffect } from "react";
import { Project } from "@/types";
import { useParams, useNavigate } from "react-router-dom";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { ChevronLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatDateForInput } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditProject = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { data: project, isLoading, error } = useProject(projectId);
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  
  console.log("EditProject: Loading project data for ID:", projectId);
  console.log("EditProject: Project data:", project);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  
  console.log("EditProject: Initial form state created with camelCase fields");
  
  // We're now using the formatDateForInput utility from dateUtils.ts
  // This ensures consistent date formatting across the application

  useEffect(() => {
    // Initialize form with project data once it's loaded
    if (project) {
      // Type assertion to treat project as Project type
      const typedProject = project as Project;
      console.log("EditProject: Setting form data from project:", typedProject);
      
      // Format dates from ISO to yyyy-MM-dd for input fields
      const formattedStartDate = formatDateForInput(typedProject.startDate);
      const formattedEndDate = formatDateForInput(typedProject.endDate);
      
      console.log("EditProject: Formatted dates for form inputs:", {
        originalStartDate: typedProject.startDate,
        formattedStartDate,
        originalEndDate: typedProject.endDate,
        formattedEndDate
      });
      
      setFormData({
        name: typedProject.name || "",
        description: typedProject.description || "",
        status: typedProject.status || "Planning",
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
      
      console.log("EditProject: Form populated with camelCase fields from project:", {
        name: typedProject.name,
        description: typedProject.description,
        status: typedProject.status,
        startDate: typedProject.startDate,
        endDate: typedProject.endDate
      });
    }
  }, [project]);
  
  const handleChange = (field: string, value: string) => {
    console.log(`EditProject: Updating form field ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("EditProject: Submitting form with data:", formData);
    
    if (!projectId) {
      console.error("EditProject: No project ID available");
      toast({
        title: "Error",
        description: "No project ID available",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.name.trim()) {
      console.error("EditProject: Project name is required");
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }
    
    // Update project with form data (flat payload, not nested)
    // Helper to convert to ISO-8601 or null
    function toIsoDate(dateStr: string | null | undefined): string | null {
      if (!dateStr) {
        console.log("EditProject: toIsoDate received empty value, returning null");
        return null;
      }
      if (dateStr.includes('T')) {
        console.log("EditProject: toIsoDate received ISO string:", dateStr);
        return dateStr;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.log("EditProject: Invalid date detected:", dateStr, "returning null");
        return null;
      }
      const iso = date.toISOString();
      console.log("EditProject: toIsoDate converted", dateStr, "to", iso);
      return iso;
    }

    // Form data is already in camelCase, simply ensure dates are in ISO format
    const updatePayload = {
      id: projectId,
      ...formData,
      startDate: toIsoDate(formData.startDate),
      endDate: toIsoDate(formData.endDate)
    };
    console.log("EditProject: Final update payload (ISO dates):", updatePayload);
    updateProject(updatePayload, {
      onSuccess: () => {
        console.log("EditProject: Project updated successfully");
        toast({
          title: "Success",
          description: "Project updated successfully"
        });
        navigate(`/projects/${projectId}`);
      },
      onError: (error) => {
        console.error("EditProject: Failed to update project:", error);
        toast({
          title: "Error",
          description: "Failed to update project. Please try again.",
          variant: "destructive"
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested project could not be found or you don't have permission to edit it.
          </p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}`)} className="mr-2">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>
        <h1 className="text-2xl font-bold">Edit Project</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter project description"
            className="min-h-32"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/projects/${projectId}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? <Spinner className="mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
