



import { z } from 'zod'

export const createProjectSchema = z.object({
    project_name: z.string().min(3, 'Name is too short'),
    project_description: z.string().min(10, 'Description is too short'),
    workspace_id: z.int(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})

// owner_id: z.int(),

export type CreateProject = z.infer<typeof createProjectSchema>;



export const updateProjectSchema = z.object({
    project_id: z.number().min(0, 'Should be greater than 0'),
    project_name: z.string().min(3, 'Name is too short'),
    project_description: z.string().min(10, 'Description is too short'),
    workspace_id: z.int(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})

export type UpdateProject = z.infer<typeof updateProjectSchema>;