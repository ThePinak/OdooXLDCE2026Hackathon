import { Router } from 'express';
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip } from '../controllers/trips.controller';
import { createStop } from '../controllers/stops.controller';
import { generateItinerary } from '../controllers/ai.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all trips routes
router.use(authenticateToken as any);

router.post('/', createTrip as any);
router.get('/', getTrips as any);
router.get('/:id', getTripById as any);
router.patch('/:id', updateTrip as any);
router.delete('/:id', deleteTrip as any);
router.post('/:tripId/stops', createStop as any);
router.post('/:tripId/generate-itinerary', generateItinerary as any);

export default router;
