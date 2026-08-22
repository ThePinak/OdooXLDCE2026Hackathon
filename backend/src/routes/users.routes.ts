import { Router } from 'express';
import { getMe, updateMe, getUserStats } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticateToken as any);

router.get('/me', getMe as any);
router.patch('/me', updateMe as any);
router.get('/me/stats', getUserStats as any);

export default router;
