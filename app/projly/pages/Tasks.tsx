
import React from "react";
import { TasksTable } from "@/components/tasks/TasksTable";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p>You need to be logged in to view and manage tasks.</p>
        <Button onClick={() => navigate('/projly/login')}>Go to Login</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <TasksTable />
    </div>
  );
};

export default Tasks;
