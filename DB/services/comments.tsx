import { NextApiRequest, NextApiResponse } from 'next';
import { Connection } from 'mysql2/promise';

export async function getCommentsByPostId(req: NextApiRequest, res: NextApiResponse, connection: Connection, postId: string) {
    try {
        const [comments] = await connection.query('SELECT * FROM comments WHERE postId = ?', [postId]);
        console.log(comments)
        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка получения комментариев" });
    }
}

export async function createComment(req: NextApiRequest, res: NextApiResponse, connection: Connection, postId: string) {
    const { comment, usersId } = req.body;

    if (!comment || !usersId) {
        return res.status(400).json({ message: "Содержимое и автор обязательны" });
    }

    try {
        const [result] = await connection.query('INSERT INTO comments (postId, comment, usersId) VALUES (?, ?, ?)', [postId, comment, usersId]);
        res.status(201).json({ message: "Комментарий создан", commentId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка создания комментария" });
    }
}
