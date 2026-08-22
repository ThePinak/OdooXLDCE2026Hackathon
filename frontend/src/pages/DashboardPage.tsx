import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Compass, LogOut, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import type { Trip, City } from '@/types';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';
import { DestinationCard } from '@/components/trip/DestinationCard';
import { AIPromptGenerator } from '@/components/trip/AIPromptGenerator';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const DashboardPage = () => {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    setAuth(null, null);
    navigate('/login');
  };

  const { data: trips = [], isLoading: isLoadingTrips } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/trips');
        return res.data;
      } catch (err: any) {
        if (!err.response) {
          // Return a beautiful mock trip if the backend is offline
          return [
            {
              id: 'mock-trip-1',
              name: 'Summer in Japan',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
              description: 'A 7-day adventure through Tokyo and Kyoto.',
              coverImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
              isPublic: false,
              userId: 'mock-user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
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
             { id: '1', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600&h=800' },
             { id: '2', name: 'Paris', country: 'France', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=600&h=800' },
             { id: '3', name: 'Bali', country: 'Indonesia', costIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=800' },
             { id: '4', name: 'New York', country: 'USA', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600&h=800' },
           ];
        }
        return res.data.slice(0, 4);
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
           return [
             { id: '1', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600&h=800' },
             { id: '2', name: 'Paris', country: 'France', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=600&h=800' },
             { id: '3', name: 'Bali', country: 'Indonesia', costIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=800' },
             { id: '4', name: 'New York', country: 'USA', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600&h=800' },
           ];
        }
        throw err;
      }
    },
    retry: 1,
  });

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky Glass Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-white/10 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Map className="w-6 h-6" />
            <span className="font-bold font-heading text-xl tracking-tight">GlobeTrotter</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleSignOut} className="text-textSecondary hover:text-red-500">
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Massive Hero Section */}
      <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden mb-12">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000" 
          alt="Dashboard Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 lg:pb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold font-heading text-textPrimary tracking-tight mb-2 drop-shadow-md">
                Welcome back,<br className="hidden lg:block"/>
                <span className="text-primary">{user?.name?.split(' ')[0] || 'Traveler'}</span>
              </h1>
              <p className="text-lg lg:text-xl text-textSecondary max-w-lg drop-shadow-sm font-medium">
                Your next adventure is waiting. Where to?
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button onClick={() => navigate('/trips/new')} size="lg" className="w-full sm:w-auto gap-2 shadow-xl shadow-primary/20">
                <PlusCircle className="w-5 h-5" />
                Plan New Trip
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Dashboard AI Section */}
        {recentTrips.length > 0 && !isLoadingTrips && (
          <section>
             <AIPromptGenerator trip={recentTrips[0]} />
          </section>
        )}
        {/* Recent Trips Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-heading text-textPrimary flex items-center gap-2">
              <Compass className="w-8 h-8 text-secondary" />
              Your Itineraries
            </h2>
            {trips.length > 5 && (
              <Link to="/trips" className="text-sm font-semibold text-secondary hover:text-secondary/80 flex items-center gap-1 group">
                View all <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            )}
          </div>

          {isLoadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-surface/50 rounded-2xl shadow-soft border border-border animate-pulse" />
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recentTrips.map(trip => (
                <motion.div key={trip.id} variants={item}>
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-surface/30 backdrop-blur-xl rounded-3xl shadow-soft border border-white/10 border-dashed">
              <Compass className="w-16 h-16 text-textSecondary mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold font-heading text-textPrimary mb-2">No trips planned yet</h3>
              <p className="text-textSecondary mb-8 max-w-sm mx-auto">Create your first itinerary to get started on your journey.</p>
              <Button onClick={() => navigate('/trips/new')} variant="secondary" size="lg">
                Create a Trip
              </Button>
            </div>
          )}
        </section>

        {/* Popular Destinations Section */}
        <section>
          <h2 className="text-3xl font-bold font-heading text-textPrimary mb-8">Inspiration</h2>
          
          {isLoadingCities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-surface/50 rounded-2xl shadow-soft border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {cities.map(city => (
                <motion.div key={city.id} variants={item} className="aspect-[3/4] w-full">
                  <DestinationCard city={city} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};
