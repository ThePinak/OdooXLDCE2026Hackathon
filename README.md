# GlobeTrotter

Welcome to the **GlobeTrotter** backend repository! This is the powerhouse behind the collaborative travel planning platform. It manages user authentication, multi-city itineraries, budget tracking, and features an integrated Google Gemini AI for automated trip generation.


## Tech Stack

- **Runtime Environment:** Node.js (v22+)
- **Framework:** Express.js (v5)
- **Language:** TypeScript
- **Database ORM:** Prisma (v5)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Validation:** Zod
- **AI Integration:** Google Generative AI SDK (`gemini-3.6-flash`)

---

## Features Implemented

1. **Secure Authentication**
   - JWT-protected routes with password hashing.
   - User registration, login, and profile fetching.
2. **Core Travel Itineraries**
   - Complete CRUD operations for `Trips` and `Stops`.
   - Advanced relational mapping to link destinations, dates, and order indexes.
3. **Destinations & Activities**
   - Seeded database featuring global cities (Paris, Rome, Tokyo, etc.) and categorized activities via Unsplash API.
   - Powerful search endpoints to filter cities by name/country and activities by category.
   - Ability to assign specific activities to time-slots within trip stops.
4. **AI Itinerary Generator**
   - Integrated Google Gemini AI to automatically generate multi-stop trips based on a single text prompt.
   - Fully contextualized: The AI only selects valid cities and activities from the database and persists them seamlessly.
5. **Budget Aggregation**
   - Dynamic budget calculations that aggregate costs per category (food, sightseeing, etc.) and per destination stop.
6. **Public Trip Sharing**
   - Ability to publish a trip and generate a public, read-only URL slug.
   - "Copy Trip" feature allowing authenticated users to deep-clone a shared itinerary into their own account.

---

## Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v22 recommended)
- PostgreSQL database (running locally or via a cloud provider like Supabase/Neon)

### 2. Installation
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file inside the `/backend` directory based on the provided `.env.example`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/GlobeTrotter?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
GEMINI_API_KEY="your_google_ai_studio_key"
PORT=3000
```

### 4. Database Setup
Push the Prisma schema to your database and run the seed script to populate cities/activities:
```bash
npx prisma db push
npm run seed
```

### 5. Start the Server
Start the development server using high-performance `tsx`:
```bash
npm run dev
```
The server will be available at `http://localhost:3000`.

---

## API Architecture Overview

The API is structured modularly. Here are the primary route prefixes:

- `POST /auth/*` - Signup, login.
- `GET /users/me` - Fetch authenticated profile.
- `GET /cities` - Search database cities.
- `GET /activities` - Filter activities by city ID and category.
- `GET, POST, PATCH, DELETE /trips` - Manage user itineraries.
- `POST /trips/:tripId/stops` - Add a destination to a trip.
- `POST /stops/:stopId/activities` - Map an activity to a specific day/time in a stop.
- `POST /trips/:tripId/generate-itinerary` - Call Gemini AI to auto-populate the trip.
- `GET /trips/:tripId/budget` - Get aggregated cost breakdown.
- `GET /share/:slug` - View a public trip (No Auth Required).
- `POST /share/:slug/copy` - Clone a public trip into your account.

*All endpoints (except signup, login, and public sharing) require a valid `Authorization: Bearer <token>` header.*

---

*Built with ❤️ for the Odoo X LDCE 2026 Hackathon by Pinak and Vraj*
