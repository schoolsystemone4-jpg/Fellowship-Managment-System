import { Router } from 'express';
import {
    createEvent,
    getEvents,
    getActiveEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    toggleEventActive,
    toggleGuestCheckin,
} from '../controllers/eventController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', asyncHandler(createEvent));
router.get('/', asyncHandler(getEvents));
router.get('/active', asyncHandler(getActiveEvent));
router.get('/:id', asyncHandler(getEventById));
router.put('/:id', asyncHandler(updateEvent));
router.delete('/:id', asyncHandler(deleteEvent));
router.patch('/:id/toggle-active', asyncHandler(toggleEventActive));
router.patch('/:id/toggle-guest-checkin', asyncHandler(toggleGuestCheckin));

export default router;
