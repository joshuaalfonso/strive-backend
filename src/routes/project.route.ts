import { Hono } from "hono";
import { CreateProjectController, GetAllProjectController, GetProjectById, GetProjectByWorkspace, GetProjectDescription, UpdateProjectController } from "../controller/project.controller.js";
import { zValidator } from "@hono/zod-validator";
import { createProjectSchema, updateProjectSchema } from "../schema/project.schema.js";
import { zodErrorHandler } from "../middleware/zodErrorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";



const projectRoute = new Hono();

projectRoute.use('', authMiddleware);

projectRoute.get('', GetProjectByWorkspace);

projectRoute.get('/project-description', GetProjectDescription);


projectRoute.get('/:project_id', GetProjectById);


projectRoute.post(
    '', 
    zValidator('json', createProjectSchema, zodErrorHandler), 
    CreateProjectController,
)

projectRoute.put(
    '', 
    zValidator('json', updateProjectSchema, zodErrorHandler), 
    UpdateProjectController,
)

export default projectRoute;