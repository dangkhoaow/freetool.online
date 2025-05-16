
import { z } from "zod";

// Define the schema for task form validation
export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  status: z.enum(["toDo", "inProgress", "completed", "onHold", "cancelled"]),
  // Added comment to explain the status values have been updated to camelCase
  dueDate: z.date().optional().nullable(),
  startDate: z.date().optional().nullable(),
  projectId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  // Remove both createdBy and priority fields as they don't exist in the database
});

// Export the type based on the schema
export type TaskFormValues = z.infer<typeof taskSchema>;

console.log('[taskSchema] Schema defined with camelCase fields.');
