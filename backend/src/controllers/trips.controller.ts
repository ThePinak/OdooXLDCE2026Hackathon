import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const createTripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  description: z.string().optional(),
});

const updateTripSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const data = createTripSchema.parse(req.body);

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description,
      },
    });

    return res.status(201).json(trip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrips = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { stops: true },
        },
      },
    });

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params as { id: string };

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              include: { activity: true },
              orderBy: [
                { dayNumber: 'asc' },
                { timeSlot: 'asc' }
              ]
            }
          }
        }
      }
    });

    if (!trip || trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    return res.status(200).json(trip);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params as { id: string };
    const data = updateTripSchema.parse(req.body);

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        description: data.description,
      },
    });

    return res.status(200).json(updatedTrip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params as { id: string };

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await prisma.trip.delete({ where: { id } });
    return res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
