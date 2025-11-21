import { Request, Response } from 'express';
import prisma from '../prisma';

// Create a new event
export const createEvent = async (req: Request, res: Response) => {
    try {
        const {
            name,
            date,
            startTime,
            endTime,
            type,
            venue,
            isRecurring,
            recurrenceRule,
            allowGuestCheckin,
        } = req.body;

        const event = await prisma.event.create({
            data: {
                name,
                date: new Date(date),
                startTime,
                endTime,
                type,
                venue,
                isRecurring: isRecurring || false,
                recurrenceRule: isRecurring ? recurrenceRule : null,
                allowGuestCheckin: allowGuestCheckin || false,
                isActive: false, // Events start as inactive
            },
        });

        res.status(201).json({
            message: 'Event created successfully',
            event,
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

// Helper to calculate event status
const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const eventStart = new Date(eventDate);
    eventStart.setHours(startHour, startMinute, 0);

    const eventEnd = new Date(eventDate);
    eventEnd.setHours(endHour, endMinute, 0);

    if (now < eventStart) return 'UPCOMING';
    if (now >= eventStart && now <= eventEnd) return 'ONGOING';
    return 'PAST';
};

// Get all events with optional filters
export const getEvents = async (req: Request, res: Response) => {
    try {
        const { isActive, type, upcoming } = req.query;

        const where: any = {};

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (type) {
            where.type = type;
        }

        if (upcoming === 'true') {
            where.date = {
                gte: new Date(),
            };
        }

        const events = await prisma.event.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                _count: {
                    select: {
                        attendances: true,
                        guestAttendances: true,
                    },
                },
            },
        });

        const eventsWithStatus = events.map(event => ({
            ...event,
            status: getEventStatus(event),
        }));

        res.json(eventsWithStatus);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// Get active event (currently running)
export const getActiveEvent = async (req: Request, res: Response) => {
    try {
        const activeEvent = await prisma.event.findFirst({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        attendances: true,
                        guestAttendances: true,
                    },
                },
            },
        });

        if (!activeEvent) {
            return res.status(404).json({ error: 'No active event found' });
        }

        res.json({
            ...activeEvent,
            status: getEventStatus(activeEvent),
        });
    } catch (error) {
        console.error('Get active event error:', error);
        res.status(500).json({ error: 'Failed to fetch active event' });
    }
};

// Get single event by ID
export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                attendances: {
                    include: {
                        member: true,
                    },
                },
                guestAttendances: true,
                _count: {
                    select: {
                        attendances: true,
                        guestAttendances: true,
                        transportBookings: true,
                    },
                },
            },
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({
            ...event,
            status: getEventStatus(event),
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If date is being updated, convert to Date object
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        const event = await prisma.event.update({
            where: { id },
            data: updateData,
        });

        res.json({
            message: 'Event updated successfully',
            event,
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

// Delete event (soft delete by setting isActive to false)
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.event.delete({
            where: { id },
        });

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

// Toggle event active status
export const toggleEventActive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({ where: { id } });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: { isActive: !event.isActive },
        });

        res.json({
            message: `Event ${updatedEvent.isActive ? 'activated' : 'deactivated'} successfully`,
            event: updatedEvent,
        });
    } catch (error) {
        console.error('Toggle event active error:', error);
        res.status(500).json({ error: 'Failed to toggle event status' });
    }
};

// Toggle guest check-in for event
export const toggleGuestCheckin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({ where: { id } });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: { allowGuestCheckin: !event.allowGuestCheckin },
        });

        res.json({
            message: `Guest check-in ${updatedEvent.allowGuestCheckin ? 'enabled' : 'disabled'} for event`,
            event: updatedEvent,
        });
    } catch (error) {
        console.error('Toggle guest check-in error:', error);
        res.status(500).json({ error: 'Failed to toggle guest check-in' });
    }
};
