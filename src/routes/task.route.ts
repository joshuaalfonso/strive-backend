import { Hono } from "hono";
import { CreateTaskController, getTaskByProjectController } from "../controller/task.controller.js";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema } from "../schema/task.schema.js";
import { zodErrorHandler } from "../middleware/zodErrorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const taskRoute = new Hono();

taskRoute.use('', authMiddleware);

taskRoute.get('/:project_id', getTaskByProjectController);

taskRoute.post(
    '', 
    zValidator('json', createTaskSchema, zodErrorHandler),
    CreateTaskController
);


export default taskRoute;