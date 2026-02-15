import jwt from "jsonwebtoken";

export const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        c.set("user", decoded); 
        await next();
    } catch {
        return c.json({ error: "Invalid token" }, 401);
    }
};
