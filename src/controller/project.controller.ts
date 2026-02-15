import { pool } from "../config/db.js";



export const GetAllProjectController = async (c: any) => {

    try {
        const [rows] = await pool.query(`
            SELECT 
                *
            FROM 
                project;
        `)

        return c.json(rows, 200);
    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load projects',
        }, 500);
    }


}

export const GetProjectByWorkspace = async (c: any) => {
    
     try {
        const query = c.req.query();
        const workspace_id = Number(query.workspace_id);

        const [rows] = await pool.query(`
            SELECT 
                *
            FROM 
                project
            WHERE 
                workspace_id = ?
        `, [workspace_id])

        return c.json(rows, 200);
    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load projects',
        }, 500);
    }

}

export const GetProjectById = async (c: any) => {

    try {
        const param = c.req.param('project_id');
        const project_id = Number(param);

        if (!project_id || isNaN(project_id)) {
            return c.json({
                success: false,
                message: 'Invalid or missing project_id',
            }, 400);
        }

        const [rows]: any = await pool.query(`
                SELECT 
                    p.project_id,
                    p.project_name,
                    p.workspace_id,
                    w.workspace_name,
                    p.project_description,
                    p.status,
                    p.owner_id,
                    u.name as owner_name,
                    p.created_at
                FROM 
                    project p
                LEFT JOIN 
                    workspace w
                ON 
                    p.workspace_id = w.workspace_id
                LEFT JOIN
                    user u
                ON
                    p.owner_id = u.user_id 
                WHERE 
                    project_id = ?
            `, [project_id])

        return c.json(rows[0], 200);
    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load project detail',
        }, 500);
    }

}


export const CreateProjectController = async (c: any) => {


    try {

        const { project_name, project_description, workspace_id } = c.req.valid('json');
        const user = c.get("user");
        const owner_id = user.user_id;
     
        await pool.query(`
            INSERT 
                INTO project (project_name, project_description, owner_id, workspace_id)
            VALUES 
                (?, ?, ?, ?)
        `, [project_name, project_description, owner_id, workspace_id]);


        return c.json({
            success: true,
            message: "Successfully created!"
        });

    }
    
    catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to create project' }, 500);
    }

}

export const GetProjectDescription = async (c: any) => {

    try {

        const query = c.req.query();
        const project_id = Number(query.project_id);

        if (!project_id || isNaN(project_id)) {
            return c.json({
                success: false,
                message: 'Invalid or missing project_id',
            }, 400);
        }

        const [rows]: any = await pool.query(`
            SELECT 
                project_description
            FROM 
                project
            WHERE 
                project_id = ?
        `, [project_id])

        return c.body(JSON.stringify(rows[0], null, 2), 200, {
            'Content-Type': 'application/json',
        });

    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load project description',
        }, 500);
    }
    
}