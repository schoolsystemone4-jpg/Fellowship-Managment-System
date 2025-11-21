import { Router } from 'express';
import { checkIn, guestCheckIn, getEventAttendance } from '../controllers/attendanceController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/check-in', asyncHandler(checkIn));
router.post('/guest-check-in', asyncHandler(guestCheckIn));
router.get('/event/:eventId', asyncHandler(getEventAttendance));

export default router;
