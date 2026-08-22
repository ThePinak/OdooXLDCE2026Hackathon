import { Response, Request } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSharedTrip = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };

    const trip = await prisma.trip.findFirst({
      where: { publicSlug: slug, isPublic: true },
      include: {
        user: { select: { name: true } },
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

    if (!trip) {
      return res.status(404).json({ message: 'Public trip not found' });
    }

    return res.status(200).json(trip);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const copySharedTrip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { slug } = req.params as { slug: string };

    const sharedTrip = await prisma.trip.findFirst({
      where: { publicSlug: slug, isPublic: true },
      include: {
        stops: {
          include: {
            activities: true
          }
        }
      }
    });

    if (!sharedTrip) {
      return res.status(404).json({ message: 'Public trip not found' });
    }

    // Create a new trip for the current user
    const newTrip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        name: `Copy of ${sharedTrip.name}`,
        startDate: sharedTrip.startDate,
        endDate: sharedTrip.endDate,
        description: sharedTrip.description,
        isPublic: false,
      }
    });

    // Copy stops and activities
    for (const stop of sharedTrip.stops) {
      const newStop = await prisma.stop.create({
        data: {
          tripId: newTrip.id,
          cityId: stop.cityId,
          startDate: stop.startDate,
          endDate: stop.endDate,
          orderIndex: stop.orderIndex,
        }
      });

      if (stop.activities.length > 0) {
        await prisma.stopActivity.createMany({
          data: stop.activities.map((sa: any) => ({
            stopId: newStop.id,
            activityId: sa.activityId,
            dayNumber: sa.dayNumber,
            timeSlot: sa.timeSlot,
          }))
        });
      }
    }

    return res.status(201).json({ message: 'Trip copied successfully', tripId: newTrip.id });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
