import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const searchCities = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (typeof search === 'string' && search.trim().length > 0) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const cities = await prisma.city.findMany({
      where: whereClause,
      take: 20, // limit results
    });

    return res.status(200).json(cities);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
