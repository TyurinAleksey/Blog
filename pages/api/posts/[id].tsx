import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/DB/utils/db';
import createPostsShema from '@/DB/Schema/PostsShema';
import { getPostById, updatePost, deletePost } from '@/DB/services/posts';

export default async function(req: NextApiRequest, res: NextApiResponse) {
    const connection = await connectToDatabase();
    const {id} = req.query;
    
    if (req.method === 'GET') {
        await getPostById(req, res, connection, id);
    } else if (req.method === 'PATCH') {
        await updatePost(req, res, connection, id);
    } else if (req.method === 'DELETE') {
        await deletePost(req, res, connection, id);
    } else {
        res.status(405).json({ message: "Метод не разрешен" });
    }
}