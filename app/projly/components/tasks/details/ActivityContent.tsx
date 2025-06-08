import { Clock, Calendar } from "lucide-react";

interface ActivityContentProps {
  updatedAt?: string | Date;
  createdAt?: string | Date;
  status: string;
}

export function ActivityContent({ 
  updatedAt, 
  createdAt, 
  status 
}: ActivityContentProps) {
  console.log('[PROJLY:TASK_DETAILS] Rendering ActivityContent');
  
  return (
    <div className="space-y-4">
      {updatedAt && (
        <div className="flex items-start gap-2 border-b pb-4">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Status updated to: {status}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(updatedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}
      
      {createdAt && (
        <div className="flex items-start gap-2 border-b pb-4">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Task created</p>
            <p className="text-sm text-muted-foreground">
              {new Date(createdAt).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
