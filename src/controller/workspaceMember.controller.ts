import { pool } from "../config/db.js";




export const GetWorkspaceMemberController = async (c: any) => {
    
     try {
        const param = c.req.param('workspace_id');
        const workspace_id = Number(param);

        const [rows]: any = await pool.query(`
            SELECT 
                w.workspace_id,
                w.workspace_name,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'workspace_id', wm.workspace_id,
                        'user_id', wm.user_id,
                        'user_fullname', u.name,
                        'user_email', u.email,
                        'workspace_role_id', wm.workspace_role_id,
                        'workspace_role', COALESCE(wr.workspace_role_name, 'No Role')
                    )
                ) as workspace_members
            FROM 
                workspace w
            LEFT JOIN 
                workspace_member wm 
            ON 
                w.workspace_id = wm.workspace_id
            LEFT JOIN 
                user u
            ON
                wm.user_id = u.user_id
            LEFT JOIN
                workspace_role wr
            ON
                wm.workspace_role_id = wr.workspace_role_id
            WHERE 
                w.workspace_id = ?
            GROUP BY 
                w.workspace_id;

        `, [workspace_id])

        return c.json(rows[0], 200);
    }

    catch (error) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Failed to load workspace memebers',
        }, 500);
    }

}