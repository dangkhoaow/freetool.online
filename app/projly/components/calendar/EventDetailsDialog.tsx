'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/app/projly/components/ui/date-picker";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar, Clock, Trash, Pencil, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  type?: string;
  status?: string;
  projectId?: string;
  taskId?: string;
}

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  projects?: { id: string; name: string }[];
}

export function EventDetailsDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isEditing = false,
  onEditToggle,
  projects = []
}: EventDetailsDialogProps) {
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(null);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:EVENT_DIALOG] ${message}`, data);
    } else {
      console.log(`[PROJLY:EVENT_DIALOG] ${message}`);
    }
  };
  
  // When event changes, update the edited event
  useEffect(() => {
    if (event) {
      log('Event data loaded in dialog:', event);
      setEditedEvent({...event});
    }
  }, [event]);
  
  // Handle form field changes
  const handleChange = (field: keyof CalendarEvent, value: any) => {
    if (!editedEvent) return;
    
    log(`Updating event field: ${String(field)}`, value);
    setEditedEvent({
      ...editedEvent,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSave = () => {
    if (!editedEvent || !onSave) return;
    
    log('Saving event:', editedEvent);
    onSave(editedEvent);
    onClose();
  };
  
  // Handle event deletion
  const handleDelete = () => {
    if (!event || !onDelete) return;
    
    log('Deleting event:', event.id);
    onDelete(event.id);
    onClose();
  };
  
  // Format date for display
  const formatEventDate = (date?: Date) => {
    if (!date) return '';
    return format(date, 'MMMM d, yyyy');
  };
  
  // Get status badge styling
  const getStatusBadgeClass = (status?: string) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };
  
  // Render view mode 
  const renderViewMode = () => {
    if (!event) return null;
    
    return (
      <>
        <div className="space-y-4 py-2">
          <div>
            <h3 className="text-xl font-semibold">{event.title}</h3>
            {event.type && (
              <div className="text-sm text-muted-foreground">{event.type}</div>
            )}
          </div>
          
          {event.status && (
            <Badge className={getStatusBadgeClass(event.status)}>
              {event.status}
            </Badge>
          )}
          
          <Separator />
          
          <div className="grid gap-2">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">Date</div>
                <div>{formatEventDate(event.start)}</div>
                {event.end && event.end !== event.start && (
                  <div>to {formatEventDate(event.end)}</div>
                )}
              </div>
            </div>
            
            {event.projectId && (
              <div className="flex items-start gap-2">
                <Pencil className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Project</div>
                  <div>
                    {projects.find(p => p.id === event.projectId)?.name || 'Unknown Project'}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {event.description && (
            <>
              <Separator />
              <div>
                <div className="font-medium text-sm mb-1">Description</div>
                <div className="text-sm whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              size="sm"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          {onEditToggle && (
            <Button 
              onClick={onEditToggle}
              size="sm"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </>
    );
  };
  
  // Render edit mode
  const renderEditMode = () => {
    if (!editedEvent) return null;
    
    return (
      <>
        <div className="space-y-4 py-2">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedEvent.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Event title"
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editedEvent.status || ''}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full gap-1.5">
              <Label>Start Date</Label>
              <DatePicker 
                date={editedEvent.start}
                setDate={(date: Date | null) => date && handleChange('start', date)}
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label>End Date</Label>
              <DatePicker 
                date={editedEvent.end || editedEvent.start}
                setDate={(date: Date | null) => date && handleChange('end', date)}
              />
            </div>
          </div>
          
          {projects.length > 0 && (
            <div className="grid w-full gap-1.5">
              <Label htmlFor="project">Project</Label>
              <Select
                value={editedEvent.projectId || ''}
                onValueChange={(value) => handleChange('projectId', value)}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedEvent.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Event description"
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          {onEditToggle && (
            <Button 
              variant="outline" 
              onClick={onEditToggle}
            >
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </>
    );
  };
  
  if (!event && !editedEvent) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Event' : 'Event Details'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edit the details of this calendar event.' 
              : 'View the details of this calendar event.'}
          </DialogDescription>
        </DialogHeader>
        
        {isEditing ? renderEditMode() : renderViewMode()}
      </DialogContent>
    </Dialog>
  );
}
