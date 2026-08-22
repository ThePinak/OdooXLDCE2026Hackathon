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

export const generateCity = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'City name is required' });
    }

    // Check if it already exists
    let city = await prisma.city.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (city) {
      return res.status(200).json(city);
    }

    // If not, generate with AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemInstruction = `
      You are a travel API. The user wants to add the city "${name}" to their database.
      Return a strict JSON object with this exact shape:
      {
        "cityName": "string (properly capitalized)",
        "countryName": "string",
        "activities": [
          { "name": "string", "category": "food" | "sightseeing" | "culture", "cost": number, "durationMinutes": number }
        ]
      }
      Include exactly 4 popular activities for this city.
      Do NOT wrap in markdown fences.
    `;

    let aiData;
    try {
      const result = await model.generateContent(systemInstruction);
      aiData = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
      // Fallback
      aiData = {
        cityName: name,
        countryName: "Unknown",
        activities: [
          { name: "Walking Tour", category: "sightseeing", cost: 0, durationMinutes: 120 }
        ]
      };
    }

    const { getRandomImage } = require('../utils/images');

    city = await prisma.city.create({
      data: {
        name: aiData.cityName,
        country: aiData.countryName,
        costIndex: 3,
        imageUrl: getRandomImage('city'),
        lat: 0,
        lng: 0,
      }
    });

    for (const act of aiData.activities) {
      await prisma.activity.create({
        data: {
          cityId: city.id,
          name: act.name,
          category: act.category || 'sightseeing',
          cost: act.cost || 20,
          duration: act.durationMinutes ? Math.ceil(act.durationMinutes / 60) : 2,
          imageUrl: getRandomImage(act.category as any),
          description: `Experience the best of ${city.name} with this fantastic activity.`
        }
      });
    }

    return res.status(201).json(city);
  } catch (error) {
    console.error('City Generation Error:', error);
    return res.status(500).json({ message: 'Failed to generate city' });
  }
};
