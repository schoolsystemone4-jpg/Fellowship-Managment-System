import { Router } from 'express';
import { getEventReport, getComparativeReport, getDashboardStats, getCustomReport } from '../controllers/reportController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/dashboard', asyncHandler(getDashboardStats));
router.get('/custom', asyncHandler(getCustomReport));
router.get('/:eventId', asyncHandler(getEventReport));
router.get('/:eventId/compare', asyncHandler(getComparativeReport));

export default router;
