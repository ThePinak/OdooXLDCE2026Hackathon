import { Router } from 'express';
import { searchCities, generateCity } from '../controllers/cities.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware
router.use(authenticateToken as any);

router.get('/', searchCities as any);
router.post('/generate', generateCity as any);

export default router;
