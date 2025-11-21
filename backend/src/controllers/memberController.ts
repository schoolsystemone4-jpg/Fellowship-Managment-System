import { Request, Response } from 'express';
import prisma from '../prisma';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Gender } from '@prisma/client';

const createMemberSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE']),
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

        const { fullName, phoneNumber, gender, residence, course, yearOfStudy } = validationResult.data;

        const member = await prisma.member.create({
            data: {
                fullName,
                phoneNumber,
                gender: gender as Gender,
                residence: residence ?? null,
                course: course ?? null,
                yearOfStudy: yearOfStudy ?? null,
                qrCode: uuidv4(),
            },
        });
        res.status(201).json(member);
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Failed to create member' });
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
