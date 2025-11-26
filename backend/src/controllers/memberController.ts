import { Request, Response } from 'express';
import prisma from '../prisma';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Gender } from '@prisma/client';

import bcrypt from 'bcryptjs';
import { generateFellowshipNumber } from '../utils/fellowshipNumberGenerator';

const createMemberSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE']),
    role: z.enum(['MEMBER', 'FELLOWSHIP_MANAGER']).optional(),
    residence: z.string().optional().nullable(),
    course: z.string().optional().nullable(),
    yearOfStudy: z.number().int().min(1).max(6).optional().nullable(),
});

export const createMember = async (req: Request, res: Response) => {
    try {
        const validationResult = createMemberSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.format()
            });
        }

        const { fullName, email, phoneNumber, gender, role, residence, course, yearOfStudy } = validationResult.data;

        const existingMember = await prisma.member.findUnique({
            where: { email },
        });

        if (existingMember) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const fellowshipNumber = await generateFellowshipNumber();
        const hashedPassword = await bcrypt.hash(fellowshipNumber, 10);

        const member = await prisma.member.create({
            data: {
                fullName,
                email,
                phoneNumber,
                password: hashedPassword,
                role: role ?? 'MEMBER',
                fellowshipNumber,
                gender: gender as Gender,
                residence: residence ?? null,
                course: course ?? null,
                yearOfStudy: yearOfStudy ?? null,
                qrCode: uuidv4(),
            },
        });

        // Return the fellowship number as the default password
        res.status(201).json({
            ...member,
            defaultPassword: fellowshipNumber,
        });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Failed to create member' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const member = await prisma.member.findUnique({
            where: { id: req.user?.id },
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const getMemberByQr = async (req: Request, res: Response) => {
    try {
        const { qrCode } = req.params;
        const member = await prisma.member.findUnique({
            where: { qrCode },
        });
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ error: 'Failed to fetch member' });
    }
};

export const getMemberByPhone = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.params;
        const member = await prisma.member.findFirst({
            where: { phoneNumber },
        });
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ error: 'Failed to fetch member' });
    }
};
