# GlobeTrotter — Development Phases & Frontend Sync

This document outlines the step-by-step phases we will follow to build the backend (using Express + TypeScript) and what the frontend should have ready at each phase to integrate smoothly.

---

## Phase 1: Project Setup & Authentication
**Backend Focus:**
- Scaffold Express + TypeScript project, Prisma schema, and local PostgreSQL connection.
- Implement `/auth/signup`, `/auth/login`, and `/users/me`.
- Implement JWT generation and middleware (`auth.middleware.ts`).

**Frontend Prerequisites (What your teammate should build):**
- Setup React + Vite + Tailwind project structure.
- Build the `SignupPage` and `LoginPage` UI.
- Configure Axios or Fetch wrapper to automatically attach the JWT (from localStorage or Zustand) to the `Authorization: Bearer <token>` header of all outgoing requests.

---

## Phase 2: Trips & Stops Core CRUD
**Backend Focus:**
- Implement `POST /trips`, `GET /trips`, `GET /trips/:id`, `PATCH /trips/:id`, `DELETE /trips/:id`.
- Implement `POST /trips/:tripId/stops`, `PATCH /stops/:id`, `DELETE /stops/:id`.

**Frontend Prerequisites:**
- Build the `DashboardPage` (My Trips list).
- Build the `CreateTripPage` (Form for name, dates).
- Build the `ItineraryBuilderPage` structure (showing a list of stops).

---

## Phase 3: Cities, Activities & Data Seeding
**Backend Focus:**
- Run the `seed.ts` script to populate Cities and Activities (using Unsplash API for images).
- Implement read-only search endpoints: `GET /cities?search=` and `GET /activities?cityId=&category=`.
- Implement assigning activities: `POST /stops/:id/activities` and `DELETE /stops/:id/activities/:activityId`.

**Frontend Prerequisites:**
- Build `CitySearchModal` to search and add stops to a trip.
- Build `ActivitySearchModal` to browse and add activities to a specific stop.
- Update `ItineraryBuilderPage` to display activities under each stop card.

---

## Phase 4: AI Itinerary Generator
**Backend Focus:**
- Integrate Google Gemini Flash SDK.
- Implement `POST /trips/:tripId/generate-itinerary` which takes a prompt, calls Gemini, parses the JSON, and creates Stop/Activity records.

**Frontend Prerequisites:**
- Build the `PromptInputBox` UI on the Itinerary Builder page.
- Implement a `GeneratingLoader` state (to handle the ~3-5 second wait time).
- Ensure the frontend refetches or updates the trip state immediately after the AI generation responds.

---

## Phase 5: Budget & Public Sharing
**Backend Focus:**
- Implement cost aggregation logic for `GET /trips/:tripId/budget`.
- Implement `PATCH /trips/:id/publish` (generate public slug).
- Implement `GET /share/:slug` (no auth needed) and `POST /share/:slug/copy` (requires auth).

**Frontend Prerequisites:**
- Build the `BudgetPage` (charts using Recharts, cost breakdown table).
- Build the `PublicItineraryPage` (read-only view for shared trips).
- Implement the "Copy Trip" button logic on the public page for logged-in users.
