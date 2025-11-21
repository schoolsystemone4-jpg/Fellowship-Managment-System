import { Request, Response } from 'express';
import prisma from '../prisma';

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { qrCode, serviceId, method } = req.body;

        // Look up member by QR code
        const member = await prisma.member.findUnique({
            where: { qrCode },
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Ensure service exists - create default if needed
        let service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            // Create default service
            service = await prisma.service.create({
                data: {
                    id: serviceId,
                    date: new Date(),
                    type: 'TUESDAY_FELLOWSHIP',
                    name: 'Default Service',
                },
            });
        }

        // Check if already checked in
        const existing = await prisma.attendance.findUnique({
            where: {
                memberId_serviceId: {
                    memberId: member.id,
                    serviceId,
                },
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'Member already checked in for this service' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                memberId: member.id,
                serviceId,
                method,
            },
            include: {
                member: true,
            },
        });

        res.status(201).json({
            message: 'Check-in successful',
            attendance,
            member: {
                fullName: member.fullName,
                phoneNumber: member.phoneNumber,
            },
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Failed to check in' });
    }
};

export const getServiceAttendance = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        const attendance = await prisma.attendance.findMany({
            where: { serviceId },
            include: { member: true },
        });
        res.json(attendance);
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
