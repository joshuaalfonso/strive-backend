import { pool } from "../config/db.js"






export const GetTaskStatusController = async (c: any) => {

    try {
        const [rows] = await pool.query('SELECT * FROM task_status')
        return c.json(rows) 
    }

   catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to load task status' }, 500);
    }

}