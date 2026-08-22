import { Router } from 'express';
import { searchActivities } from '../controllers/activities.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authenticateToken as any);

router.get('/', searchActivities as any);

export default router;
