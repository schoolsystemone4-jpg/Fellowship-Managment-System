import { Router } from 'express';
import { bookTransport, getTransportList } from '../controllers/transportController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/book', asyncHandler(bookTransport));
router.get('/event/:eventId', asyncHandler(getTransportList));

export default router;
