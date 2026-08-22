"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copySharedTrip = exports.getSharedTrip = void 0;
const prisma_1 = require("../utils/prisma");
const getSharedTrip = async (req, res) => {
    try {
        const { slug } = req.params;
        const trip = await prisma_1.prisma.trip.findFirst({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSharedTrip = getSharedTrip;
const copySharedTrip = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { slug } = req.params;
        const sharedTrip = await prisma_1.prisma.trip.findFirst({
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
        const newTrip = await prisma_1.prisma.trip.create({
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
            const newStop = await prisma_1.prisma.stop.create({
                data: {
                    tripId: newTrip.id,
                    cityId: stop.cityId,
                    startDate: stop.startDate,
                    endDate: stop.endDate,
                    orderIndex: stop.orderIndex,
                }
            });
            if (stop.activities.length > 0) {
                await prisma_1.prisma.stopActivity.createMany({
                    data: stop.activities.map(sa => ({
                        stopId: newStop.id,
                        activityId: sa.activityId,
                        dayNumber: sa.dayNumber,
                        timeSlot: sa.timeSlot,
                    }))
                });
            }
        }
        return res.status(201).json({ message: 'Trip copied successfully', tripId: newTrip.id });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.copySharedTrip = copySharedTrip;
