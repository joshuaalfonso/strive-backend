import { Hono } from "hono";
import { CreateTaskController, getTaskByIDController, getTaskByProjectController, updateTaskDescription } from "../controller/task.controller.js";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema } from "../schema/task.schema.js";
import { zodErrorHandler } from "../middleware/zodErrorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const taskRoute = new Hono();

taskRoute.use('', authMiddleware);

taskRoute.get('/:project_id', getTaskByProjectController);
taskRoute.get('/detail/:task_id', getTaskByIDController);

taskRoute.post(
    '', 
    zValidator('form', createTaskSchema, zodErrorHandler),
    CreateTaskController
);

taskRoute.get('/detail/:task_id', getTaskByIDController);
taskRoute.put('/:task_id/description', updateTaskDescription);


export default taskRoute;