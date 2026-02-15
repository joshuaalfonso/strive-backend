import { Hono } from "hono";
import { createUserController, getAllUserController, loginUserController } from "../controller/user.controller.js";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema, loginUserSchema } from "../schema/user.schema.js";
import { zodErrorHandler } from "../middleware/zodErrorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";



const userRoute = new Hono();

userRoute.use('', authMiddleware);

userRoute.get('', getAllUserController);


userRoute.post(
    '/signup', 
    zValidator('json', createUserSchema, zodErrorHandler), 
    createUserController
);

userRoute.post(
    '/login',
    zValidator('json', loginUserSchema, zodErrorHandler), 
    loginUserController
)



export default userRoute