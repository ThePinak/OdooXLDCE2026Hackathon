# GlobeTrotter

GlobeTrotter is a personalized, collaborative travel planning platform. It allows users to build multi-city itineraries, assign activities, manage budgets, and generate AI-assisted trip drafts.

## Current Progress

**Phase 1, 2, & 3 Complete (Backend)**
- **Tech Stack Setup**: Node.js, Express, TypeScript, Prisma (v5), and PostgreSQL.
- **Authentication**: JWT-based auth flows (Signup, Login, Get/Update Profile).
- **Core CRUD**: Fully functional endpoints for creating and managing Trips and Stops.
- **Database Schema**: All core models (`User`, `Trip`, `City`, `Stop`, `Activity`, `StopActivity`) are defined and pushed to the local database.
- **Cities & Activities**: Implemented endpoints for searching cities and filtering activities.
- **Itinerary Building**: Functional endpoints to assign/remove activities to specific stops (`StopActivity`).
- **Data Seeding**: Automated script to seed database with major cities and categorized activities.

## Next Steps
- Phase 4: Google Gemini AI integration for itinerary generation.
- Phase 5: Budget aggregation and Public Trip Sharing.

## How to Run (Backend)
1. Navigate to `/backend`.
2. Install dependencies: `npm install`
3. Set up your `.env` (use `.env.example` as a template).
4. Run migrations: `npx prisma db push`
5. Start development server: `npm run dev`
