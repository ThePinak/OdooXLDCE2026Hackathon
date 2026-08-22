import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlusCircle, Compass } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { Trip } from '@/types';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/trip/TripCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const MyTripsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery<Trip[]>({
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/trips/${id}`);
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
           console.warn('Backend not reachable, mocking trip deletion.');
           return;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary flex items-center gap-2">
              <Compass className="w-8 h-8 text-primary" />
              My Trips
            </h1>
            <p className="mt-2 text-textSecondary">Manage and edit your travel itineraries.</p>
          </div>
          <Button onClick={() => navigate('/trips/new')} className="shrink-0 gap-2">
            <PlusCircle className="w-5 h-5" />
            Plan New Trip
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-surface rounded-xl shadow-soft border border-border animate-pulse" />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {trips.map((trip) => (
              <motion.div key={trip.id} variants={itemVariants} layout>
                <TripCard 
                  trip={trip} 
                  showActions={true} 
                  onDelete={handleDelete} 
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-xl shadow-soft border border-border border-dashed">
            <Compass className="w-16 h-16 text-textSecondary mx-auto mb-4" />
            <h3 className="text-xl font-medium text-textPrimary">No trips planned yet</h3>
            <p className="mt-2 text-textSecondary max-w-sm mx-auto">
              Your itinerary collection is empty. Start planning your next adventure today!
            </p>
            <Button onClick={() => navigate('/trips/new')} variant="secondary" className="mt-8">
              Create your first trip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
