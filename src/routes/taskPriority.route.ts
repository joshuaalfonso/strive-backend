import { Hono } from "hono";
import { GetTaskPriorityController } from "../controller/taskPriority.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";



const taskPrirityRoute = new Hono();

taskPrirityRoute.use('', authMiddleware);

taskPrirityRoute.get('', GetTaskPriorityController)


export default taskPrirityRoute;