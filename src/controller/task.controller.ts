import { pool } from "../config/db.js";





export const getTaskByProjectController = async (c: any) => {

    try {
        const param = c.req.param('project_id');
        const project_id = Number(param);

        if (!project_id || isNaN(project_id)) {
            return c.json({
                success: false,
                message: 'Invalid or missing project_id',
            }, 400);
        }

            // const [rows]: any = await pool.query(`
            //     SELECT 
            //         t.task_id,
            //         t.title,
            //         t.description,
            //         t.project_id,
            //         p.project_name,
            //         t.task_status_id,
            //         ts.task_status_name,
            //         t.task_priority_id,
            //         tp.task_priority_name,
            //         t.start_date,
            //         t.end_date,
            //         t.completed_at,
            //         t.created_at
            //     FROM 
            //         task t
            //     LEFT JOIN
            //         project p
            //     ON
            //         t.project_id = p.project_id
            //     LEFT JOIN
            //         task_status ts
            //     ON
            //         t.task_status_id = ts.task_status_id
            //     LEFT JOIN
            //         task_priority tp
            //     ON
            //         t.task_priority_id = tp.task_priority_id
            //     WHERE 
            //         t.project_id = ?
            // `, [project_id])

            const [rows]: any = await pool.query(`
                SELECT 
                    t.task_id,
                    t.title,
                    t.description,
                    t.project_id,
                    p.project_name,
                    t.task_status_id,
                    ts.task_status_name,
                    t.task_priority_id,
                    tp.task_priority_name,
                    t.start_date,
                    t.end_date,
                    t.completed_at,
                    t.created_at,

                    COALESCE(
                        JSON_ARRAYAGG(
                            IF(u.user_id IS NOT NULL,
                                JSON_OBJECT(
                                    'user_id', u.user_id,
                                    'user_fullname', u.name
                                ),
                                NULL
                            )
                        ),
                        JSON_ARRAY()
                    ) AS assignees

                FROM task t

                LEFT JOIN project p ON t.project_id = p.project_id
                LEFT JOIN task_status ts ON t.task_status_id = ts.task_status_id
                LEFT JOIN task_priority tp ON t.task_priority_id = tp.task_priority_id
                LEFT JOIN task_assignees ta ON t.task_id = ta.task_id
                LEFT JOIN user u ON ta.user_id = u.user_id

                WHERE t.project_id = ?

                GROUP BY t.task_id
            `, [project_id]);


        return c.json(rows, 200);

    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load project task',
        }, 500);
    }

}


export const CreateTaskController = async (c: any) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const { 
            project_id, 
            title, 
            description, 
            task_priority_id, 
            start_date, 
            end_date,
            assignees    
        } = c.req.valid('json');

        const user = c.get("user");
        const created_by = user.user_id;


        const [result]:any = await pool.query(`
            INSERT 
                INTO task (project_id, title, description, task_priority_id, start_date, end_date, created_by)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?)
        `, [project_id, title, description, task_priority_id, start_date, end_date, created_by]);

        const task_id = result.insertId;

        if (assignees && assignees.length > 0) {
            const values = assignees.map((user_id: number | string) => [
                task_id,
                Number(user_id)
            ]);

            await pool.query(`
                INSERT 
                    INTO task_assignees (task_id, user_id)
                VALUES 
                    ?
            `, [values]);
        }

        await connection.commit();

        return c.json({
            success: true,
            message: "Successfully created!"
        });

    }

    catch (error) {
        console.error(error);

        await connection.rollback();

        return c.json({ 
            success: false,
            message: 'Failed to create task' 
        }, 500);
    }

    finally {
        connection.release(); // always release
    }

}