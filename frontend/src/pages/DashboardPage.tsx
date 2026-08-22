import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Compass } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import type { Trip, City } from '@/types';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { DestinationCard } from '@/components/trip/DestinationCard';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: trips = [], isLoading: isLoadingTrips } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/trips');
        return res.data;
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          return [];
        }
        throw err;
      }
    },
  });

  const { data: cities = [], isLoading: isLoadingCities } = useQuery<City[]>({
    queryKey: ['cities', 'popular'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/cities');
        if (res.data.length === 0) {
           return [
             { id: '1', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800' },
             { id: '2', name: 'Paris', country: 'France', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e90760b6164?auto=format&fit=crop&q=80&w=800' },
             { id: '3', name: 'Bali', country: 'Indonesia', costIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
           ];
        }
        return res.data.slice(0, 4);
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
           return [
             { id: '1', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800' },
             { id: '2', name: 'Paris', country: 'France', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e90760b6164?auto=format&fit=crop&q=80&w=800' },
             { id: '3', name: 'Bali', country: 'Indonesia', costIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
           ];
        }
        throw err;
      }
    },
    // Adding a fallback mechanism if backend fails (since it might not be up yet)
    retry: 1,
    initialData: [],
  });

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Area */}
      <div className="bg-surface border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary font-sans">
              Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!
            </h1>
            <p className="mt-2 text-textSecondary">
              Where to next? Start planning your next adventure.
            </p>
          </div>
          <Button onClick={() => navigate('/trips/new')} className="shrink-0 gap-2">
            <PlusCircle className="w-5 h-5" />
            Plan New Trip
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Recent Trips Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" />
              Recent Trips
            </h2>
            {trips.length > 5 && (
              <Link to="/trips" className="text-sm font-medium text-secondary hover:text-secondary/80">
                View all trips &rarr;
              </Link>
            )}
          </div>

          {isLoadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-surface rounded-xl shadow-soft border border-border animate-pulse" />
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl shadow-soft border border-border border-dashed">
              <Compass className="w-12 h-12 text-textSecondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-textPrimary">No trips planned yet</h3>
              <p className="mt-1 text-textSecondary">Create your first itinerary to get started.</p>
              <Button onClick={() => navigate('/trips/new')} variant="secondary" className="mt-6">
                Create a Trip
              </Button>
            </div>
          )}
        </section>

        {/* Popular Destinations Section */}
        <section>
          <h2 className="text-2xl font-bold text-textPrimary mb-6">Popular Destinations</h2>
          
          {isLoadingCities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/3] bg-surface rounded-xl shadow-soft border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cities.map(city => (
                <DestinationCard 
                  key={city.id} 
                  city={city} 
                  // No specific action on click for dashboard popular destination yet
                  // but we could route them to a city detail or search
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
