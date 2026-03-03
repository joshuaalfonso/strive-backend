import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";



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
                    ) AS assignees,

                    (
                        SELECT 
                            COUNT(*)
                        FROM 
                            task_attachment tat
                        WHERE 
                            tat.task_id = t.task_id
                    ) AS attachment_count

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

export const getTaskByIDController = async(c: any) => {

     try {
        const param = c.req.param('task_id');
        const task_id = Number(param);

        if (!task_id || isNaN(task_id)) {
            return c.json({
                success: false,
                message: 'Invalid or missing task_id',
            }, 400);
        }

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

                    COALESCE((
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'user_id', u.user_id,
                                'user_fullname', u.name
                            )
                        )
                        FROM task_assignees ta
                        JOIN user u ON ta.user_id = u.user_id
                        WHERE ta.task_id = t.task_id
                    ), JSON_ARRAY()) AS assignees,

                    COALESCE((
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'task_attachment_id', tat.task_attachment_id,
                                'file_name', tat.file_name,
                                'original_name', tat.original_name,
                                'file_type', tat.file_type,
                                'size', tat.size
                            )
                        )
                        FROM task_attachment tat
                        WHERE tat.task_id = t.task_id
                    ), JSON_ARRAY()) AS attachment,

                    COALESCE((
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'subtask_id', st.subtask_id,
                                'task_id', st.task_id,
                                'subtask_title', st.subtask_title,
                                'is_completed', st.is_completed,
                                'created_at', st.created_at
                            )
                        )
                        FROM subtask st
                        WHERE st.task_id = t.task_id
                    ), JSON_ARRAY()) AS subtasks


                FROM task t

                LEFT JOIN project p ON t.project_id = p.project_id
                LEFT JOIN task_status ts ON t.task_status_id = ts.task_status_id
                LEFT JOIN task_priority tp ON t.task_priority_id = tp.task_priority_id
                LEFT JOIN task_assignees ta ON t.task_id = ta.task_id
                LEFT JOIN task_attachment tat ON t.task_id = tat.task_id
                LEFT JOIN subtask subt ON t.task_id = subt.task_id
                LEFT JOIN user u ON ta.user_id = u.user_id

                WHERE t.task_id = ?

            `, [task_id]);


        return c.json(rows[0], 200);

    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load task',
        }, 500);
    }

}


export const CreateTaskController = async (c: any) => {

    const connection = await pool.getConnection();

    try {
        
        const formData = await c.req.formData();

        const project_id = formData.get('project_id');
        const title = formData.get('title');
        const description = formData.get('description');
        const task_priority_id = formData.get('task_priority_id');
        const start_date = formData.get('start_date');
        const end_date = formData.get('end_date');

        const assignees = formData.getAll("assignees[]");

        const user = c.get("user");
        const created_by = user.user_id;

        const [result]:any = await pool.query(`
            INSERT 
                INTO task (project_id, title, description, task_priority_id, start_date, end_date, created_by)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?)
        `, [+project_id, title, description, task_priority_id, start_date, end_date, created_by]);

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

        const subtasks = formData.getAll("subtasks[]") as any[];

        if (subtasks) {
            for (const subtask of subtasks) {

                await pool.query(`
                INSERT 
                        INTO subtask (task_id, subtask_title, created_by)
                    VALUES 
                        (?, ?, ?)
                `, [task_id, subtask, created_by]);

            }
        }

        const attachments = formData.getAll("attachments[]") as File[];

        if (attachments) {
            for (const file of attachments) {
                const buffer = Buffer.from(await file.arrayBuffer())

                const isImage = file.type.startsWith("image/")
                const folder = isImage ? "images" : "documents"

                const extension = file.name.split(".").pop();
                const fileName = `${randomUUID()}.${extension}`;

                const filePath = join(process.cwd(), "uploads", folder, fileName);

                await mkdir(join(process.cwd(), "uploads/images"), { recursive: true })
                await mkdir(join(process.cwd(), "uploads/documents"), { recursive: true })

                await writeFile(filePath, buffer);

                await pool.query(`
                INSERT 
                        INTO task_attachment (task_id, file_name, original_name, file_type, size)
                    VALUES 
                        (?, ?, ?, ?, ?)
                `, [task_id, fileName, file.name, file.type, file.size]);

            }
        }
        

        await connection.commit();

        return c.json({
            success: true,
            message: "Successfully created!"
        })

    }

    catch (error) {
        console.log(error)
        await connection.rollback();
        return c.json({
            success: false,
            message: 'Something went wrong'
        }, 500)
    }

    finally {
        connection.release();
    }

    // const connection = await pool.getConnection();

    // try {

    //     await connection.beginTransaction();

    //     const { 
    //         project_id, 
    //         title, 
    //         description, 
    //         task_priority_id, 
    //         start_date, 
    //         end_date,
    //         assignees    
    //     } = c.req.valid('json');

    //     const user = c.get("user");
    //     const created_by = user.user_id;


    //     const [result]:any = await pool.query(`
    //         INSERT 
    //             INTO task (project_id, title, description, task_priority_id, start_date, end_date, created_by)
    //         VALUES 
    //             (?, ?, ?, ?, ?, ?, ?)
    //     `, [project_id, title, description, task_priority_id, start_date, end_date, created_by]);

    //     const task_id = result.insertId;

    //     if (assignees && assignees.length > 0) {
    //         const values = assignees.map((user_id: number | string) => [
    //             task_id,
    //             Number(user_id)
    //         ]);

    //         await pool.query(`
    //             INSERT 
    //                 INTO task_assignees (task_id, user_id)
    //             VALUES 
    //                 ?
    //         `, [values]);
    //     }

    //     await connection.commit();

    //     return c.json({
    //         success: true,
    //         message: "Successfully created!"
    //     });

    // }

    // catch (error) {
    //     console.error(error);

    //     await connection.rollback();

    //     return c.json({ 
    //         success: false,
    //         message: 'Failed to create task' 
    //     }, 500);
    // }

    // finally {
    //     connection.release(); // always release
    // }

}


export const completeSubtaskController = async (c: any) => {
    
    try {

        const subtask_id = c.req.param('subtask_id');
        const { is_completed } = await c.req.json();
        const completed = is_completed ? 1 : 0;

        const [result]: any = await pool.query(`
            UPDATE
                subtask 
            SET 
                is_completed = ?
            WHERE
                subtask_id = ?
        `, [completed, subtask_id]);

        if (result.affectedRows === 0) {
            return c.json({ 
                success: true,
                message: 'Subtask not found' 
            }, 404);
        }

         return c.json({ 
            success: true,
            message: 'Successfully updated',
            is_completed
        }, 200);

    }

    catch (error) {
        console.log(error)
        return c.json({ 
            success: true,
            message: 'Something went wrong' 
        }, 500);
    }

}

