"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeActivityFromStop = exports.addActivityToStop = exports.deleteStop = exports.updateStop = exports.createStop = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const createStopSchema = zod_1.z.object({
    cityId: zod_1.z.string().uuid('Invalid city ID'),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
});
const updateStopSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    orderIndex: zod_1.z.number().int().optional(),
});
const addActivitySchema = zod_1.z.object({
    activityId: zod_1.z.string().uuid('Invalid activity ID'),
    dayNumber: zod_1.z.number().int().optional(),
    timeSlot: zod_1.z.string().optional(),
});
const createStop = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { tripId } = req.params;
        const data = createStopSchema.parse(req.body);
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: { stops: true },
        });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        const city = await prisma_1.prisma.city.findUnique({ where: { id: data.cityId } });
        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }
        const maxOrderIndex = trip.stops.length > 0
            ? Math.max(...trip.stops.map((s) => s.orderIndex))
            : 0;
        const stop = await prisma_1.prisma.stop.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createStop = createStop;
const updateStop = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const data = updateStopSchema.parse(req.body);
        const stop = await prisma_1.prisma.stop.findUnique({
            where: { id },
            include: { trip: true },
        });
        if (!stop || stop.trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Stop not found' });
        }
        const updatedStop = await prisma_1.prisma.stop.update({
            where: { id },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                orderIndex: data.orderIndex,
            },
        });
        return res.status(200).json(updatedStop);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateStop = updateStop;
const deleteStop = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const stop = await prisma_1.prisma.stop.findUnique({
            where: { id },
            include: { trip: true },
        });
        if (!stop || stop.trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Stop not found' });
        }
        await prisma_1.prisma.stop.delete({ where: { id } });
        return res.status(200).json({ message: 'Stop deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteStop = deleteStop;
const addActivityToStop = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const data = addActivitySchema.parse(req.body);
        const stop = await prisma_1.prisma.stop.findUnique({
            where: { id },
            include: { trip: true },
        });
        if (!stop || stop.trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Stop not found' });
        }
        const stopActivity = await prisma_1.prisma.stopActivity.create({
            data: {
                stopId: id,
                activityId: data.activityId,
                dayNumber: data.dayNumber,
                timeSlot: data.timeSlot,
            },
            include: { activity: true }
        });
        return res.status(201).json(stopActivity);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addActivityToStop = addActivityToStop;
const removeActivityFromStop = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { id, activityId } = req.params;
        const stop = await prisma_1.prisma.stop.findUnique({
            where: { id },
            include: { trip: true },
        });
        if (!stop || stop.trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Stop not found' });
        }
        // Delete by stopId and activityId - wait, stopActivity doesn't have a compound unique key in schema
        // Let's delete the first one that matches
        const stopActivity = await prisma_1.prisma.stopActivity.findFirst({
            where: { stopId: id, activityId }
        });
        if (!stopActivity) {
            return res.status(404).json({ message: 'Activity not found in this stop' });
        }
        await prisma_1.prisma.stopActivity.delete({ where: { id: stopActivity.id } });
        return res.status(200).json({ message: 'Activity removed from stop' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.removeActivityFromStop = removeActivityFromStop;
