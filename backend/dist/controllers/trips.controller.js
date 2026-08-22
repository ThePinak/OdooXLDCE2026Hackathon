"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishTrip = exports.getTripBudget = exports.deleteTrip = exports.updateTrip = exports.getTripById = exports.getTrips = exports.createTrip = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const createTripSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    description: zod_1.z.string().optional(),
});
const updateTripSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().optional(),
});
const createTrip = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const data = createTripSchema.parse(req.body);
        const trip = await prisma_1.prisma.trip.create({
            data: {
                userId: req.user.id,
                name: data.name,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                description: data.description,
            },
        });
        return res.status(201).json(trip);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createTrip = createTrip;
const getTrips = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const trips = await prisma_1.prisma.trip.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { stops: true },
                },
            },
        });
        return res.status(200).json(trips);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTrips = getTrips;
const getTripById = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const trip = await prisma_1.prisma.trip.findUnique({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTripById = getTripById;
const updateTrip = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const data = updateTripSchema.parse(req.body);
        const trip = await prisma_1.prisma.trip.findUnique({ where: { id } });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        const updatedTrip = await prisma_1.prisma.trip.update({
            where: { id },
            data: {
                name: data.name,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                description: data.description,
            },
        });
        return res.status(200).json(updatedTrip);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateTrip = updateTrip;
const deleteTrip = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const trip = await prisma_1.prisma.trip.findUnique({ where: { id } });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        await prisma_1.prisma.trip.delete({ where: { id } });
        return res.status(200).json({ message: 'Trip deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteTrip = deleteTrip;
const getTripBudget = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { tripId } = req.params;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                stops: {
                    include: {
                        city: true,
                        activities: {
                            include: { activity: true }
                        }
                    }
                }
            }
        });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        let totalCost = 0;
        const byCategoryMap = {};
        const byStop = [];
        for (const stop of trip.stops) {
            let stopTotal = 0;
            for (const sa of stop.activities) {
                const cost = sa.activity.cost || 0;
                totalCost += cost;
                stopTotal += cost;
                const cat = sa.activity.category;
                byCategoryMap[cat] = (byCategoryMap[cat] || 0) + cost;
            }
            byStop.push({
                stopId: stop.id,
                cityName: stop.city.name,
                total: stopTotal
            });
        }
        const byCategory = Object.keys(byCategoryMap).map(key => ({
            category: key,
            total: byCategoryMap[key]
        }));
        return res.status(200).json({ totalCost, byCategory, byStop });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTripBudget = getTripBudget;
const publishTrip = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const trip = await prisma_1.prisma.trip.findUnique({ where: { id } });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        let slug = trip.publicSlug;
        if (!slug) {
            // Generate a simple unique slug
            slug = trip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
        }
        const updatedTrip = await prisma_1.prisma.trip.update({
            where: { id },
            data: {
                isPublic: true,
                publicSlug: slug
            }
        });
        return res.status(200).json({
            message: 'Trip published successfully',
            publicSlug: updatedTrip.publicSlug
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.publishTrip = publishTrip;
