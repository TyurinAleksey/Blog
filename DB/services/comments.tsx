import { NextApiRequest, NextApiResponse } from 'next';
import { Connection } from 'mysql2/promise';

export async function getCommentsByPostId(req: NextApiRequest, res: NextApiResponse, connection: Connection, postId: string) {
    try {
        const [comments] = await connection.query('SELECT * FROM comments WHERE postId = ?', [postId]);
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

export async function getCommentById(req: NextApiRequest, res: NextApiResponse, connection: Connection, id: string) {
    try {
        const [comment] = await connection.query('SELECT * FROM comments WHERE id = ?', [id]) 

        if (comment.length === 0) {
            return res.status(404).json({ message: "Комментарий не найден" });
        }

        res.status(200).json(comment[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка получения комментария" });
    }
}

export async function updateCommentById(req: NextApiRequest, res: NextApiResponse, connection: Connection, id: string) {
    try {
        const [commentById] = await connection.query('SELECT * FROM comments WHERE id = ?', [id]);
        if (commentById.length === 0) {
            return res.status(404).json({ message: "Комментарий не найден" });
        }

        const { comment } = req.body;

        const updateCommentQuery = `
            UPDATE comments 
            SET 
                comment = COALESCE(?, comment)
            WHERE id = ?;
        `;

        await connection.query(updateCommentQuery, [comment, id]);
        const [updatedComment] = await connection.query('SELECT * FROM comments WHERE id = ?', [id]);

        res.status(200).json(updatedComment)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при обновлении комментария" });
    }
}

export async function deleteComment(req: NextApiRequest, res: NextApiResponse, connection: Connection, id: string) {
    try {
        const deleteCommentQuery = `
            DELETE FROM comments WHERE id = ?;
        `;
        await connection.query(deleteCommentQuery, [id]);

        return res.status(200).json({ message: "Комментарий успешно удален" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при удалении комментария" });
    }
}