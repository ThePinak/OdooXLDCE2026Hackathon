import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const createStopSchema = z.object({
  cityId: z.string().uuid('Invalid city ID'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const updateStopSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  orderIndex: z.number().int().optional(),
});

export const createStop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { tripId } = req.params as { tripId: string };
    const data = createStopSchema.parse(req.body);

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: true },
    });

    if (!trip || trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const maxOrderIndex = trip.stops.length > 0 
      ? Math.max(...trip.stops.map((s: { orderIndex: number }) => s.orderIndex)) 
      : 0;

    const stop = await prisma.stop.create({
      data: {
        tripId,
        cityId: data.cityId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        orderIndex: maxOrderIndex + 1,
      },
      include: { city: true }
    });

    return res.status(201).json(stop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params as { id: string };
    const data = updateStopSchema.parse(req.body);

    const stop = await prisma.stop.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!stop || stop.trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    const updatedStop = await prisma.stop.update({
      where: { id },
      data: {
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        orderIndex: data.orderIndex,
      },
    });

    return res.status(200).json(updatedStop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStop = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params as { id: string };

    const stop = await prisma.stop.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!stop || stop.trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    await prisma.stop.delete({ where: { id } });
    return res.status(200).json({ message: 'Stop deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
