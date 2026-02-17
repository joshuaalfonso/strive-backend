import { pool } from "../config/db.js";





export const GetTaskPriorityController = async (c: any) => {

    try {
        const [rows] = await pool.query('SELECT * FROM task_priority')
        return c.json(rows) 
    }

   catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to load task priority' }, 500);
    }

}