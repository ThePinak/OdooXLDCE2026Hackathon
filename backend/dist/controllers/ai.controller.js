"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerary = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const generative_ai_1 = require("@google/generative-ai");
const generateSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(5, 'Prompt must be at least 5 characters long'),
});
const generateItinerary = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { tripId } = req.params;
        const { prompt } = generateSchema.parse(req.body);
        const trip = await prisma_1.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip || trip.userId !== req.user.id) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        // Calculate duration in days
        const diffTime = Math.abs(trip.endDate.getTime() - trip.startDate.getTime());
        let durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (durationDays < 1)
            durationDays = 1;
        // Fetch context data
        const cities = await prisma_1.prisma.city.findMany();
        const activities = await prisma_1.prisma.activity.findMany();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
        }
        // Initialize Gemini
        // Fallback: If using Groq (OpenAI compatible), you could use the openai package with groq base url.
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });
        const systemInstruction = `
      You are an expert travel planner AI. 
      The user is taking a trip for ${durationDays} days.
      Their prompt is: "${prompt}".

      You MUST select ONLY from the following provided cities and activities. Do NOT hallucinate IDs.
      Distribute the total ${durationDays} days across the chosen cities using 'dayCount'.
      
      Available Cities:
      ${JSON.stringify(cities.map(c => ({ id: c.id, name: c.name, country: c.country })))}

      Available Activities:
      ${JSON.stringify(activities.map(a => ({ id: a.id, name: a.name, cityId: a.cityId, category: a.category })))}

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
        }
        catch (parseError) {
            // Retry once without markdown fences
            const retryResult = await model.generateContent(systemInstruction + '\\nRETURN RAW JSON NO MARKDOWN FENCES.');
            aiData = JSON.parse(retryResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
        }
        if (!aiData.stops || !Array.isArray(aiData.stops)) {
            throw new Error('Invalid JSON shape from AI');
        }
        // Clean existing stops for this trip to replace with AI generated ones
        await prisma_1.prisma.stop.deleteMany({ where: { tripId } });
        let currentDate = new Date(trip.startDate);
        let currentOrderIndex = 1;
        for (const stopInput of aiData.stops) {
            const stopEndDate = new Date(currentDate);
            stopEndDate.setDate(stopEndDate.getDate() + (stopInput.dayCount || 1) - 1);
            const stop = await prisma_1.prisma.stop.create({
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
                const activitiesToCreate = stopInput.activityIds.map((actId, idx) => ({
                    stopId: stop.id,
                    activityId: actId,
                    dayNumber: (idx % (stopInput.dayCount || 1)) + 1,
                    timeSlot: idx % 2 === 0 ? 'morning' : 'afternoon'
                }));
                // Use createMany to insert all activities for this stop
                if (activitiesToCreate.length > 0) {
                    await prisma_1.prisma.stopActivity.createMany({
                        data: activitiesToCreate,
                        skipDuplicates: true
                    });
                }
            }
            currentDate = new Date(stopEndDate);
            currentDate.setDate(currentDate.getDate() + 1); // Next stop starts the day after
        }
        // Update trip with prompt
        await prisma_1.prisma.trip.update({
            where: { id: tripId },
            data: { generatedFromPrompt: prompt }
        });
        // Fetch and return the fully populated trip
        const populatedTrip = await prisma_1.prisma.trip.findUnique({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0]?.message || 'Validation error' });
        }
        console.error('AI Generation Error:', error);
        return res.status(500).json({ message: 'Failed to generate itinerary from AI' });
    }
};
exports.generateItinerary = generateItinerary;
