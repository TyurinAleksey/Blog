import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from "jsonwebtoken";
import connectToDatabase from "./db";
import createUserSchema from "@/DB/Schema/UsersSchema";

interface User {
    id: string;
    email: string;
    username: string;
}

interface AuthenticatedRequest extends NextApiRequest {
    user?: User;
}

const checkAuth = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const token = (req.headers.authorization || "").replace(/Bearer\s?/, "").trim();

        if (!token) {
            return res.status(401).json({ message: "Нет доступа: токен отсутствует" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "Секретный ключ не установлен" });
        }

        const connection = await connectToDatabase();
        await createUserSchema(connection);

        const decoded = jwt.verify(token, jwtSecret) as { _id: string };

        const findUserQuery = `SELECT * FROM users WHERE id = ?`;
        const [users] = await connection.query(findUserQuery, [decoded._id]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const user = users[0];
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
        };

        return;
    } catch (err) {
        console.error("Ошибка при проверке авторизации:", err);

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Нет доступа: неверный токен" });
        }

        res.status(500).json({ message: "Ошибка сервера" });
    }
};

export default checkAuth;
