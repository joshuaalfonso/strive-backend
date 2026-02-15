import { ZodError } from 'zod'
import type { Context } from 'hono'

export const zodErrorHandler = (result: any, c: Context) => {
  if (!result.success) {
    const error = result.error as ZodError<any>
    return c.json({ errors: error.flatten() }, 422)
  }
}
