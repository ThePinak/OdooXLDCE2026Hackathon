import { Router } from 'express';
import { updateStop, deleteStop, addActivityToStop, removeActivityFromStop } from '../controllers/stops.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all stops routes
router.use(authenticateToken as any);

router.patch('/:id', updateStop as any);
router.delete('/:id', deleteStop as any);
router.post('/:id/activities', addActivityToStop as any);
router.delete('/:id/activities/:activityId', removeActivityFromStop as any);

export default router;
