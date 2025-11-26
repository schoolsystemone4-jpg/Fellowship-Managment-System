import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';

const prisma = new PrismaClient();

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });
};

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if user exists by email or fellowship number (allow login with either)
    // For now, let's stick to email as per requirements, but fellowship number is also unique.
    // Requirement says: "The registered user can access their created account using their email address and default password"

    const user = await prisma.member.findUnique({
        where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            fellowshipNumber: user.fellowshipNumber,
            qrCode: user.qrCode,
            token: generateToken(user.id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});
