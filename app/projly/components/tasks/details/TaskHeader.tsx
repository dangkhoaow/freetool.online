interface TaskHeaderProps {
  title: string;
  taskId: string;
}

export function TaskHeader({ title, taskId }: TaskHeaderProps) {
  console.log('[PROJLY:TASK_DETAILS] Rendering TaskHeader, title:', title);
  
  return (
    <div className="container mx-auto pb-4">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        Task ID: {taskId}
      </p>
    </div>
  );
}
