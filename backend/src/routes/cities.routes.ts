import { Router } from 'express';
import { searchCities } from '../controllers/cities.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authenticateToken as any);

router.get('/', searchCities as any);

export default router;
