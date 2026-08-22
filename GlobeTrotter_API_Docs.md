# GlobeTrotter — API Endpoints & Responses

Base URL: `http://localhost:3000` (or as configured)
Authentication: All protected routes require the `Authorization` header: `Bearer <JWT_TOKEN>`

---

## 1. Auth & Users

### `POST /auth/signup`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

### `POST /auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

### `GET /users/me`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

---

## 2. Trips

### `POST /trips`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Summer in Japan",
    "startDate": "2026-07-01T00:00:00Z",
    "endDate": "2026-07-15T00:00:00Z",
    "description": "A two-week trip across Tokyo and Kyoto."
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "id": "trip-uuid",
    "name": "Summer in Japan",
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-15T00:00:00.000Z",
    "description": "A two-week trip across Tokyo and Kyoto.",
    "isPublic": false,
    "createdAt": "2026-08-22T10:00:00.000Z"
  }
  ```

### `GET /trips`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  [
    {
      "id": "trip-uuid",
      "name": "Summer in Japan",
      "startDate": "2026-07-01T00:00:00.000Z",
      "endDate": "2026-07-15T00:00:00.000Z",
      "coverImageUrl": null,
      "_count": { "stops": 2 }
    }
  ]
  ```

### `GET /trips/:id`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  {
    "id": "trip-uuid",
    "name": "Summer in Japan",
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-15T00:00:00.000Z",
    "description": "A two-week trip across Tokyo and Kyoto.",
    "stops": [
      {
        "id": "stop-uuid",
        "startDate": "2026-07-01T00:00:00.000Z",
        "endDate": "2026-07-07T00:00:00.000Z",
        "orderIndex": 1,
        "city": {
          "id": "city-uuid",
          "name": "Tokyo",
          "country": "Japan",
          "imageUrl": "https://example.com/tokyo.jpg"
        },
        "activities": [
          {
            "id": "stop-activity-uuid",
            "dayNumber": 1,
            "timeSlot": "Morning",
            "activity": {
              "id": "activity-uuid",
              "name": "Visit Senso-ji",
              "category": "sightseeing",
              "cost": 0,
              "duration": 2,
              "imageUrl": "https://example.com/sensoji.jpg"
            }
          }
        ]
      }
    ]
  }
  ```

### `PATCH /trips/:id`
- **Auth Required**: Yes
- **Request Body** (All optional): `{ "name": "New Name", "description": "New Desc" }`
- **Success Response (200)**: Updated Trip object (shallow).

### `DELETE /trips/:id`
- **Auth Required**: Yes
- **Success Response (200)**: `{ "message": "Trip deleted successfully" }`

---

## 3. Stops & Activities

### `POST /trips/:tripId/stops`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "cityId": "city-uuid",
    "startDate": "2026-07-01T00:00:00Z",
    "endDate": "2026-07-07T00:00:00Z"
  }
  ```
- **Success Response (201)**: Created Stop object.

### `PATCH /stops/:id`
- **Auth Required**: Yes
- **Request Body** (All optional): `{ "startDate": "...", "endDate": "...", "orderIndex": 2 }`
- **Success Response (200)**: Updated Stop object.

### `DELETE /stops/:id`
- **Auth Required**: Yes
- **Success Response (200)**: `{ "message": "Stop deleted successfully" }`

### `POST /stops/:id/activities`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "activityId": "activity-uuid",
    "dayNumber": 1, 
    "timeSlot": "Afternoon"
  }
  ```
- **Success Response (201)**: Created StopActivity object.

### `DELETE /stops/:id/activities/:activityId`
- **Auth Required**: Yes
- **Success Response (200)**: `{ "message": "Activity removed from stop" }`

---

## 4. Seed Data Search

### `GET /cities?search=tokyo`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  [
    {
      "id": "city-uuid",
      "name": "Tokyo",
      "country": "Japan",
      "costIndex": 4,
      "imageUrl": "..."
    }
  ]
  ```

### `GET /activities?cityId=city-uuid&category=food`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  [
    {
      "id": "activity-uuid",
      "name": "Sushi Making Class",
      "category": "food",
      "cost": 50,
      "duration": 3,
      "imageUrl": "..."
    }
  ]
  ```

---

## 5. AI & Budget

### `POST /trips/:tripId/generate-itinerary`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "prompt": "I want a 7 day trip focused on food and culture in Japan."
  }
  ```
- **Success Response (201)**: Full Trip object (same shape as `GET /trips/:id`), populated with stops and activities.

### `GET /trips/:tripId/budget`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  {
    "totalCost": 150,
    "byCategory": [
      { "category": "food", "total": 100 },
      { "category": "sightseeing", "total": 50 }
    ],
    "byStop": [
      { "stopId": "stop-uuid", "cityName": "Tokyo", "total": 150 }
    ]
  }
  ```

---

## 6. Sharing

### `PATCH /trips/:id/publish`
- **Auth Required**: Yes
- **Success Response (200)**:
  ```json
  {
    "isPublic": true,
    "publicSlug": "abcd1234"
  }
  ```

### `GET /share/:slug`
- **Auth Required**: No
- **Success Response (200)**: Full Trip object (same shape as `GET /trips/:id` but read-only, stripped of user data).

### `POST /share/:slug/copy`
- **Auth Required**: Yes
- **Success Response (201)**:
  ```json
  {
    "id": "new-trip-uuid",
    "message": "Trip copied successfully"
  }
  ```
