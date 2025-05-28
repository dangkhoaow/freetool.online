'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash } from 'lucide-react';

interface TaskNotFoundUIProps {
  errorMessage?: string;
}

/**
 * Displays a user-friendly UI when a task cannot be found
 * This is used when users click on notifications for tasks that have been deleted
 */
export function TaskNotFoundUI({ errorMessage }: TaskNotFoundUIProps) {
  const router = useRouter();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[TASK_NOT_FOUND] ${message}`, data);
    } else {
      console.log(`[TASK_NOT_FOUND] ${message}`);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            log('Back to tasks clicked');
            router.push('/projly/tasks');
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
      
      <Card className="w-full shadow-md">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-2xl">Task Not Found</CardTitle>
          <CardDescription>The task you are looking for could not be found</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trash className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">This task may have been deleted</h3>
            <p className="text-muted-foreground mb-6">
              {errorMessage || 'The task you are trying to access does not exist or you do not have permission to view it.'}
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push('/projly/tasks')}>
                View All Tasks
              </Button>
              <Button onClick={() => router.push('/projly/tasks/new')}>
                Create New Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
