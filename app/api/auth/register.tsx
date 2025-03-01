import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from "@/DB/utils/db";
import { body, validationResult } from 'express-validator';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createUsersShema from "@/DB/Schema/UsersSchema"

const registerValidation = [
    body("email", "Неверный формат почты").isEmail(),
    body("password", "Пароль должен быть минимум 5 символов").isLength({ min: 5 }),
    body("username", "Укажите имя").isLength({ min: 3 }),
    body("avatarUrl", "Неверная ссылка на изображение").optional().isURL(),
];

interface RegisterRequestBody {
    email: string;
    password: string;
    username: string;
    avatarUrl?: string;
}

export default async function register(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Метод не разрешен" });
    }

    try {
        const connection = await connectToDatabase();

        await createUsersShema(connection);

        await Promise.all(registerValidation.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, username, avatarUrl }: RegisterRequestBody = req.body;

        const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
        const [existingUser ] = await connection.query(checkUserQuery, [email]);

        if (existingUser .length > 0) {
            return res.status(400).json({ message: "Пользователь с таким email уже существует" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        if (avatarUrl && avatarUrl.length > 255) {
            return res.status(400).json({ message: "Ссылка на аватар слишком длинная" });
        }

        const insertUserQuery = `
            INSERT INTO users (username, email, password, avatarUrl)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await connection.query(insertUserQuery, [
            username,
            email,
            passwordHash,
            avatarUrl || null,
        ]);

        const token = jwt.sign({ _id: result.insertId }, process.env.JWT_SECRET as string, { expiresIn: "30d" });

        res.json({
            message: "Пользователь создан",
            username,
            email,
            avatarUrl,
            token
        });

    } catch (error) {
        console.error("Ошибка при регистрации пользователя:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}
