"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchActivities = void 0;
const prisma_1 = require("../utils/prisma");
const searchActivities = async (req, res) => {
    try {
        const { cityId, category } = req.query;
        if (!cityId || typeof cityId !== 'string') {
            return res.status(400).json({ message: 'cityId is required' });
        }
        const whereClause = { cityId };
        if (typeof category === 'string' && category.trim().length > 0) {
            whereClause.category = category;
        }
        const activities = await prisma_1.prisma.activity.findMany({
            where: whereClause,
        });
        return res.status(200).json(activities);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchActivities = searchActivities;
