import { body, validationResult } from 'express-validator';

export const postsValidation = [
    body("title", "Введите заголовок статьи").isLength({ min: 3 }).isString(),
    body("text", "Введите текст статьи").isLength({ min: 10 }).isString(),
    body("tags", "Неверный формат тэгов (укажите массив)").optional().isArray(),
    body("comment", "Неверный формат комментария (укажите массив)").optional().isArray(),
    body("imageUrl", "Неверная ссылка на изображение").optional().isURL(),
    body("authorId", "Укажите идентификатор автора").optional().isInt(),
];