import { Router } from 'express';
import { getSharedTrip, copySharedTrip, getFeaturedTrips } from '../controllers/share.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint for featured templates
router.get('/featured/trips', getFeaturedTrips as any);

// Public endpoint, no auth middleware needed
router.get('/:slug', getSharedTrip as any);

// Protected endpoint, requires auth to copy a trip
router.post('/:slug/copy', authenticateToken as any, copySharedTrip as any);

export default router;
