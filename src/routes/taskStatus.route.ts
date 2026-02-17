import { Hono } from "hono";
import { GetTaskStatusController } from "../controller/taskStatus.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";



const taskStatusRoute = new Hono();

taskStatusRoute.use('', authMiddleware);

taskStatusRoute.get('', GetTaskStatusController)


export default taskStatusRoute;