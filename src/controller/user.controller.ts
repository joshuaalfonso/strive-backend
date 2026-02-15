import type { Context } from "hono";
import { pool } from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import 'dotenv/config'
// import { success } from "zod";


export const getAllUserController = async (c: Context) => {
    const [rows] = await pool.query('SELECT * FROM user')
    return c.json(rows)
}   


export const createUserController = async (c: any) => {

    const { name, email, password } = c.req.valid('json');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result]: any = await pool.query(`
            INSERT 
                INTO user (name, email, password)
            VALUES 
                (?, ?, ?)
        `, [name, email, hashedPassword]);

        const userId = result.insertId;

        const [insertedWorkspaceResult]: any = await pool.query(
            `
                INSERT 
                    INTO workspace (owner_id, workspace_name)
                VALUES 
                    (?, ?)
            `,
            [userId, `${name}'s Workspace`]
        );

        const workspaceId = insertedWorkspaceResult.insertId;

        await pool.query(
            `
                UPDATE
                    user
                SET 
                    last_workspace_id = ?
                WHERE
                    user_id = ?
            `,
            [workspaceId, userId]
        )

        await pool.query(
            `
                INSERT 
                    INTO workspace_member (workspace_id, user_id, workspace_role_id)
                VALUES
                    (?, ?, ?)
            `,
            [workspaceId, userId, 1]
        )

        return c.json({
            success: true,
            message: "You’ve successfully created your account. Let’s get started!"
        });
    }

    catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to create user' }, 500);
    }

}

export const loginUserController = async (c: any) => {

    const { email, password } = c.req.valid('json');

    try {

        const [rows]: any = await pool.query(
            `
                SELECT 
                    u.user_id, u.name, u.email, u.password, u.last_workspace_id, w.workspace_name 
                FROM 
                    user u
                LEFT JOIN
                    workspace w
                ON
                    u.last_workspace_id = w.workspace_id
                WHERE 
                    email = ?
            `,
            [email]
        );

        if (rows.length === 0) {
            return c.json({ success: false, message: "Invalid email or password" }, 401);
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return c.json({ success: false, message: "Invalid email or password" }, 401);
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return c.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
            },
            workspace: {
                workspace_id: user.last_workspace_id,
                workspace_name: user.workspace_name
            }
        });

    }

    catch (error) {
        console.error(error);
        return c.json({ 
            success: false,
            message: 'Login failed' 
        }, 500);
    }

}