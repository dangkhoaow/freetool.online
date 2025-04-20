"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TaskItem from "./task-item"

interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [error, setError] = useState("")

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem("todo-tasks")
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks))
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e)
        setTasks([])
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.trim()) {
      setError("Task cannot be empty")
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: Date.now(),
    }

    setTasks((prevTasks) => [task, ...prevTasks])
    setNewTask("")
    setError("")
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>My Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value)
                if (e.target.value.trim()) setError("")
              }}
              onKeyDown={handleKeyDown}
              className={error ? "border-red-500" : ""}
            />
            <Button onClick={addTask} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks yet. Add your first task above!</p>
          ) : (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
