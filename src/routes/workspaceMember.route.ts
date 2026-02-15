import { Hono } from "hono";
import { GetWorkspaceMemberController } from "../controller/workspaceMember.controller.js";


const workspaceMemberRoute = new Hono();



workspaceMemberRoute.get('/:workspace_id', GetWorkspaceMemberController);



export default workspaceMemberRoute;