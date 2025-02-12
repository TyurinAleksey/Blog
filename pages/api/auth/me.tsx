import checkAuth from '@/DB/utils/checkAuth';
import type { NextApiRequest, NextApiResponse } from 'next';

interface User {
    id: string;
    email: string;
    username: string;
    password?: string;
}

interface AuthenticatedRequest extends NextApiRequest {
    user?: User;
}

export default async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        await checkAuth(req, res);

        if (!req.user) {
            return res.status(401).json({ message: "Пользователь не авторизован" });
        }

        const { password, ...userData } = req.user;

        res.json({
            ...userData,
        });
    } catch (err) {
        console.error("Ошибка при нахождении данных пользователя:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
