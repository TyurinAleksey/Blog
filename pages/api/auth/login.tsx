import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiHandler } from 'next';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import connectToDatabase from "@/DB/utils/db";
import createUsersShema from "@/DB/Schema/UsersSchema";

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthenticatedRequest extends NextApiRequest {
    userId?: string;
    user?: User;
}

export default async (req: AuthenticatedRequest, res: NextApiResponse, next: NextApiHandler) => {
    try {
        const connection = await connectToDatabase();

        await createUsersShema(connection);

        const { email, password } = req.body;

        const findUserQuery = `SELECT * FROM users WHERE email = ?`;
        const [users] = await connection.query(findUserQuery, [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: "Пользователь с таким email не найден" });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Неверный логин или пароль" });
        }

        const token = jwt.sign(
            {
                _id: user.id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d",
            }
        );

        const { password: _, ...userData } = user;

        res.json({
            message: "Пользователь авторизован",
            ...userData,
            token,
        });
    } catch (err) {
        console.error("Ошибка при авторизации пользователя:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
