import { Hono } from "hono";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { completeSubtaskController } from "../controller/task.controller.js";




const subTaskRoute = new Hono();

subTaskRoute.use('', authMiddleware);


subTaskRoute.post('/:subtask_id/complete', completeSubtaskController);

export default subTaskRoute;