import { pool } from "../config/db.js";



export const CreateTaskController = async (c: any) => {

    try {
        const { 
            project_id, 
            title, 
            description, 
            task_priority_id, 
            start_date, 
            end_date 
        } = c.req.valid('json');

        const user = c.get("user");
        const created_by = user.user_id;


        await pool.query(`
            INSERT 
                INTO task (project_id, title, description, task_priority_id, start_date, end_date, created_by)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?)
        `, [project_id, title, description, task_priority_id, start_date, end_date, created_by]);


        return c.json({
            success: true,
            message: "Successfully created!"
        });

    }

    catch (error) {
        console.error(error);
        return c.json({ 
            success: false,
            message: 'Failed to create task' 
        }, 500);
    }

}