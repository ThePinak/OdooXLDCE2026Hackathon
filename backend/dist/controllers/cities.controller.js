"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCities = void 0;
const prisma_1 = require("../utils/prisma");
const searchCities = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search || typeof search !== 'string') {
            const allCities = await prisma_1.prisma.city.findMany({ take: 20 });
            return res.status(200).json(allCities);
        }
        const cities = await prisma_1.prisma.city.findMany({
            where: {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { country: { contains: search, mode: 'insensitive' } }
                ]
            },
            take: 20
        });
        return res.status(200).json(cities);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchCities = searchCities;
