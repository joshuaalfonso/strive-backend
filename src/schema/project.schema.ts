



import { z } from 'zod'

export const createProjectSchema = z.object({
    project_name: z.string().min(3, 'Name is too short'),
    project_description: z.string().min(10, 'Description is too short'),
    workspace_id: z.int(),
})
// owner_id: z.int(),

export type CreateProject = z.infer<typeof createProjectSchema>