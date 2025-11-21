import { Request, Response } from 'express';
import prisma from '../prisma';

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { qrCode, eventId, method } = req.body;

        // Look up member by QR code
        const member = await prisma.member.findUnique({
            where: { qrCode },
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found. Please register first.' });
        }

        // Check if event exists and is active
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (!event.isActive) {
            return res.status(403).json({ error: 'Check-in not available. Event is not active.' });
        }

        // Check if event is currently ongoing (time-based)
        const now = new Date();
        const eventDate = new Date(event.date);
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        const eventStart = new Date(eventDate);
        eventStart.setHours(startHour, startMinute, 0);

        const eventEnd = new Date(eventDate);
        eventEnd.setHours(endHour, endMinute, 0);

        if (now < eventStart || now > eventEnd) {
            return res.status(403).json({ error: 'Check-in not available. Event is not currently ongoing.' });
        }

        // Check if already checked in
        const existing = await prisma.attendance.findUnique({
            where: {
                memberId_eventId: {
                    memberId: member.id,
                    eventId,
                },
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already checked in for this event' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                memberId: member.id,
                eventId,
                method,
            },
            include: {
                member: true,
                event: true,
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

// Guest check-in (no QR code required)
export const guestCheckIn = async (req: Request, res: Response) => {
    try {
        const { eventId, guestName, guestPhone, purpose } = req.body;

        // Check if event exists and is active
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (!event.isActive) {
            return res.status(403).json({ error: 'Check-in not available. Event is not active.' });
        }

        // Check if event is currently ongoing (time-based)
        const now = new Date();
        const eventDate = new Date(event.date);
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        const eventStart = new Date(eventDate);
        eventStart.setHours(startHour, startMinute, 0);

        const eventEnd = new Date(eventDate);
        eventEnd.setHours(endHour, endMinute, 0);

        if (now < eventStart || now > eventEnd) {
            return res.status(403).json({ error: 'Check-in not available. Event is not currently ongoing.' });
        }

        if (!event.allowGuestCheckin) {
            return res.status(403).json({ error: 'Guest check-in is not enabled for this event' });
        }

        const guestAttendance = await prisma.guestAttendance.create({
            data: {
                eventId,
                guestName,
                guestPhone,
                purpose,
            },
            include: {
                event: true,
            },
        });

        res.status(201).json({
            message: 'Guest check-in successful',
            guestAttendance,
        });
    } catch (error) {
        console.error('Guest check-in error:', error);
        res.status(500).json({ error: 'Failed to check in guest' });
    }
};

export const getEventAttendance = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;

        const attendance = await prisma.attendance.findMany({
            where: { eventId },
            include: { member: true },
        });

        const guestAttendance = await prisma.guestAttendance.findMany({
            where: { eventId },
        });

        res.json({
            memberAttendance: attendance,
            guestAttendance,
            totalMembers: attendance.length,
            totalGuests: guestAttendance.length,
            totalAttendance: attendance.length + guestAttendance.length,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};
