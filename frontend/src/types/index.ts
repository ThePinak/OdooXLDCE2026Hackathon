export interface User {
  id: string;
  name: string;
  email: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  costIndex: number;
  imageUrl: string | null;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: string;
  cost: number;
  duration: number;
  imageUrl: string | null;
}

export interface StopActivity {
  id: string;
  stopId: string;
  activityId: string;
  dayNumber: number | null;
  timeSlot: string | null;
  activity: Activity;
}

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
  city: City;
  activities: StopActivity[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  _count?: {
    stops: number;
  };
  stops?: Stop[];
}
