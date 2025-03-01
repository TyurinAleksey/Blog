import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/DB/utils/db';
import { getCommentsByPostId, createComment } from '@/DB/services/comments';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const connection = await connectToDatabase();
    const { id: postId } = req.query;

    if (req.method === 'GET') {
        // Получение комментариев поста
        console.log(postId)
        await getCommentsByPostId(req, res, connection, postId as string);
    } else if (req.method === 'POST') {
        // Создание комментария
        await createComment(req, res, connection, postId as string);
    } else {
        res.status(405).json({ message: "Метод не разрешен" });
    }
}