import { NextApiRequest } from 'next';

declare module 'next' {
    interface NextApiRequest {
        user?: {
            id: string;
            email: string;
            username: string;
            password?: string;
        };
    }
}
