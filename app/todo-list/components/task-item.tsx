"use client"

import { Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 flex-1">
        <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => onToggle(task.id)} />
        <label
          htmlFor={`task-${task.id}`}
          className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-500" : ""}`}
        >
          {task.text}
        </label>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="text-gray-500 hover:text-red-500"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
