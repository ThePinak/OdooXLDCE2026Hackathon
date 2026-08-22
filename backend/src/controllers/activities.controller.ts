import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const searchActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { cityId, category } = req.query;
    
    if (!cityId || typeof cityId !== 'string') {
      return res.status(400).json({ message: 'cityId is required' });
    }

    const whereClause: any = { cityId };
    
    if (typeof category === 'string' && category.trim().length > 0) {
      whereClause.category = category;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
    });

    return res.status(200).json(activities);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
