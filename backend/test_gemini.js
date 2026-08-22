const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemInstruction = `
      You are an expert travel planner AI. 
      The user is taking a trip for 3 days.
      Their prompt is: "I want to go to Italy".

      Return a strict JSON object with this exact shape:
      {
        "stops": [
          {
            "cityName": "string",
            "countryName": "string",
            "dayCount": number,
            "activities": [
              {
                "name": "string",
                "category": "food" | "sightseeing" | "culture",
                "cost": number,
                "durationMinutes": number
              }
            ]
          }
        ]
      }
      Do NOT wrap in markdown fences.
    `;
    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();
    console.log("Raw Response:");
    console.log(responseText);
    
    try {
      const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
      console.log("Parsed Successfully:", parsed.stops.length, "stops");
    } catch(e) {
      console.log("Parse Error:", e.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
