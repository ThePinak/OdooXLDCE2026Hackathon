"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCities = void 0;
const prisma_1 = require("../utils/prisma");
const searchCities = async (req, res) => {
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
        const cities = await prisma_1.prisma.city.findMany({
            where: whereClause,
            take: 20, // limit results
        });
        return res.status(200).json(cities);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchCities = searchCities;
