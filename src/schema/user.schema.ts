




import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password is too short')
})

export type CreateUser = z.infer<typeof createUserSchema>


export const loginUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password is too short')
})

export type LoginUser = z.infer<typeof loginUserSchema>