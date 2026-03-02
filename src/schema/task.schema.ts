



import { z } from 'zod'

export const createTaskSchema = z.object({
  project_id: z.coerce.number(),
  title: z.string(),
  description: z.string().min(10, 'Description is too short.'),
  task_priority_id: z.coerce.number(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  assignees: z.coerce.string(),
  subtasks: z.coerce.string().optional(),
})

export type CreateTask = z.infer<typeof createTaskSchema>