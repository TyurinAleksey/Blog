import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/DB/utils/db';
import { getCommentById, updateCommentById, deleteComment } from '@/DB/services/comments';

export default async function(req: NextApiRequest, res: NextApiResponse) {
    const connection = await connectToDatabase();
    const {id} = req.query;
    
    if (req.method === 'GET') {
        await getCommentById(req, res, connection, id as string);
    } else if (req.method === 'PATCH') {
        await updateCommentById(req, res, connection, id as string);
    } else if (req.method === 'DELETE') {
        await deleteComment(req, res, connection, id as string);
    } else {
        res.status(405).json({ message: "Метод не разрешен" });
    }
}