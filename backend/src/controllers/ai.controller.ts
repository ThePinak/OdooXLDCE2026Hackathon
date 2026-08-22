import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { GoogleGenerativeAI } from '@google/generative-ai';

const generateSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters long'),
});

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { tripId } = req.params as { tripId: string };
    const { prompt } = generateSchema.parse(req.body);

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Calculate duration in days
    const diffTime = Math.abs(trip.endDate.getTime() - trip.startDate.getTime());
    let durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (durationDays < 1) durationDays = 1;

    // Fetch context data
    const cities = await prisma.city.findMany();
    const activities = await prisma.activity.findMany();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
    }

    // Initialize Gemini
    // Fallback: If using Groq (OpenAI compatible), you could use the openai package with groq base url.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemInstruction = `
      You are an expert travel planner AI. 
      The user is taking a trip for ${durationDays} days.
      Their prompt is: "${prompt}".

      You MUST select ONLY from the following provided cities and activities. Do NOT hallucinate IDs.
      Distribute the total ${durationDays} days across the chosen cities using 'dayCount'.
      
      Available Cities:
      ${JSON.stringify(cities.map((c: any) => ({ id: c.id, name: c.name, country: c.country })))}

      Available Activities:
      ${JSON.stringify(activities.map((a: any) => ({ id: a.id, name: a.name, cityId: a.cityId, category: a.category })))}

      Return a strict JSON object with this exact shape:
      {
        "stops": [
          {
            "cityId": "string",
            "dayCount": number,
            "activityIds": ["string"]
          }
        ]
      }
      Do NOT wrap in markdown fences.
    `;

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();
    
    let aiData;
    try {
      aiData = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (parseError) {
      // Retry once without markdown fences
      const retryResult = await model.generateContent(systemInstruction + '\\nRETURN RAW JSON NO MARKDOWN FENCES.');
      aiData = JSON.parse(retryResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    }

    if (!aiData.stops || !Array.isArray(aiData.stops)) {
      throw new Error('Invalid JSON shape from AI');
    }

    // Clean existing stops for this trip to replace with AI generated ones
    await prisma.stop.deleteMany({ where: { tripId } });

    let currentDate = new Date(trip.startDate);
    let currentOrderIndex = 1;

    for (const stopInput of aiData.stops) {
      const stopEndDate = new Date(currentDate);
      stopEndDate.setDate(stopEndDate.getDate() + (stopInput.dayCount || 1) - 1);

      const stop = await prisma.stop.create({
        data: {
          tripId,
          cityId: stopInput.cityId,
          orderIndex: currentOrderIndex++,
          startDate: new Date(currentDate),
          endDate: new Date(stopEndDate),
        }
      });

      // Create StopActivities
      if (stopInput.activityIds && Array.isArray(stopInput.activityIds)) {
        const activitiesToCreate = stopInput.activityIds.map((actId: string, idx: number) => ({
          stopId: stop.id,
          activityId: actId,
          dayNumber: (idx % (stopInput.dayCount || 1)) + 1,
          timeSlot: idx % 2 === 0 ? 'morning' : 'afternoon'
        }));
        
        // Use createMany to insert all activities for this stop
        if (activitiesToCreate.length > 0) {
          await prisma.stopActivity.createMany({
            data: activitiesToCreate,
            skipDuplicates: true
          });
        }
      }

      currentDate = new Date(stopEndDate);
      currentDate.setDate(currentDate.getDate() + 1); // Next stop starts the day after
    }

    // Update trip with prompt
    await prisma.trip.update({
      where: { id: tripId },
      data: { generatedFromPrompt: prompt }
    });

    // Fetch and return the fully populated trip
    const populatedTrip = await prisma.trip.findUnique({
      where: { id: tripId },
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

    return res.status(200).json(populatedTrip);

  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
    }
    console.error('AI Generation Error:', error);
    return res.status(500).json({ message: 'Failed to generate itinerary from AI' });
  }
};
