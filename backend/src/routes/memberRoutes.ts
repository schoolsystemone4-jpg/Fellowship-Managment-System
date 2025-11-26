import { Router } from 'express';
import { createMember, getMemberByQr, getMemberByPhone, getProfile } from '../controllers/memberController';
import { asyncHandler } from '../utils/asyncHandler';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, authorize('FELLOWSHIP_MANAGER'), asyncHandler(createMember));
router.get('/profile', protect, asyncHandler(getProfile));
router.get('/qr/:qrCode', protect, asyncHandler(getMemberByQr));
router.get('/phone/:phoneNumber', protect, authorize('FELLOWSHIP_MANAGER'), asyncHandler(getMemberByPhone));

export default router;
