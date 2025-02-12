import React from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';
import { body, validationResult } from 'express-validator';
import connectToDatabase from '@/DB/utils/db';
import createPostsShema from '@/DB/Schema/PostsShema';
import { console } from 'inspector';

const postsValidation = [
    body("title", "Введите заголовок статьи").isLength({ min: 3 }).isString(),
    body("text", "Введите текст статьи").isLength({ min: 10 }).isString(),
    body("tags", "Неверный формат тэгов (укажите массив)").optional().isArray(),
    body("comment", "Неверный формат комментария (укажите массив)").optional().isArray(),
    body("imageUrl", "Неверная ссылка на изображение").optional().isURL(),
    body("authorId", "Укажите идентификатор автора").isInt(),
];

export default async function(req: NextApiRequest, res: NextApiResponse) {
    const connection = await connectToDatabase();
    await createPostsShema(connection);

    if (req.method === 'POST') {
        try {
            await Promise.all(postsValidation.map(validation => validation.run(req)));

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, text, imageUrl, tags, comment, authorId } = req.body;

            const insertPostQuery = `
                INSERT INTO posts (title, text, imageUrl, authorId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, NOW(), NOW());
            `;
            const [result] = await connection.query(insertPostQuery, [title, text, imageUrl, authorId]);

            if (tags && tags.length > 0) {
                const insertTagsQuery = `
                    INSERT INTO tags (postId, tag) 
                    VALUES (?, ?);
                `;
                await Promise.all(tags.map((tag: any) => connection.query(insertTagsQuery, [result.insertId, tag])));
            }

            if (comment && comment.length > 0) {
                const insertCommentQuery = `
                    INSERT INTO comments (postId, usersId, comment) 
                    VALUES (?, ?, ?);
                `;
                await Promise.all(comment.map(commentText => connection.query(insertCommentQuery, [result.insertId, authorId, commentText])));
            }

            return res.status(201).json({ message: "Пост успешно создан", postId: result.insertId });
        } catch (error) {
            console.error("Ошибка при создании поста:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    } else if (req.method === 'GET') {
        const {id} = req.query
        if  (id) {
            try {
                const getPostQuery = `
                    SELECT * FROM posts WHERE id = ?;
                `
                const [post] = await connection.query(getPostQuery, [id])

                if (post.length === 0) {
                    return res.status(400).json({message: "Пост не найден"})
                }

                const getTagsQuery = `
                    SELECT tag FROM tags WHERE postId = ?;
                `;
                const [tags] = await connection.query(getTagsQuery, [id]);

                const getCommentsQuery = `
                    SELECT comment, usersId, createdAt FROM comments WHERE postId = ?;
                `;
                const [comments] = await connection.query(getCommentsQuery, [id]);

                const postData = {
                    ...post[0],
                    tags: tags.map(tag => tag.tag),
                    comments: comments 
                };

                return res.status(200).json(postData)
            } catch (error) {
                console.error("Ошибка при получении поста:", id, error);
                res.status(500).json({ message: "Ошибка сервера" });
            }
        } else {
            try {
                const getPostsQuery = `
                    SELECT * FROM posts;
                `;

                const [posts] = await connection.query(getPostsQuery);

                const postsWithDetails = await Promise.all(posts.map(async (post) => {
                    const getTagsQuery = `
                        SELECT tag FROM tags WHERE postId = ?;
                    `;
                    const [tags] = await connection.query(getTagsQuery, [post.id]);
    
                    const getCommentsQuery = `
                        SELECT comment, usersId, createdAt FROM comments WHERE postId = ?;
                    `;
                    const [comments] = await connection.query(getCommentsQuery, [post.id]);
    
                    return {
                        ...post,
                        tags: tags.map(tag => tag.tag), // Извлекаем только значения тегов
                        comments: comments // Возвращаем все комментарии
                    };
                }));
                
                return res.status(200).json(postsWithDetails);
            } catch (error) {
                console.error("Ошибка при получении постов:", error);
                res.status(500).json({ message: "Ошибка сервера" });
            }
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Метод ${req.method} не разрешен`);
    }
}
