import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/DB/utils/db';
import createPostsShema from '@/DB/Schema/PostsShema';
import { createPost, getPosts } from '@/DB/services/posts';

export default async function(req: NextApiRequest, res: NextApiResponse) {
    const connection = await connectToDatabase();
    await createPostsShema(connection);

    if (req.method === 'POST') {
        await createPost(req, res, connection);
    } else if (req.method === 'GET'){
        await getPosts(req, res, connection);
    } else {
        res.status(405).json({ message: "Метод не разрешен" });
    }
}