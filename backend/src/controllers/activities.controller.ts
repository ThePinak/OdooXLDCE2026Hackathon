import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getRandomImage } from '../utils/images';

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

export const createActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { cityId, name, category, cost, duration } = req.body;
    
    if (!cityId || !name) {
      return res.status(400).json({ message: 'cityId and name are required' });
    }

    const activity = await prisma.activity.create({
      data: {
        cityId,
        name,
        category: category || 'sightseeing',
        cost: cost || 0,
        duration: duration || 2,
        imageUrl: getRandomImage(category as any),
        description: 'A custom activity planned by you.'
      }
    });

    return res.status(201).json(activity);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
