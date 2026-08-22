import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '@/lib/api-client';
import type { Trip } from '@/types';
import { Button } from '@/components/ui/Button';

export const ItineraryBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: ['trip', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/trips/${id}`);
        return res.data;
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          return {
             id,
             name: 'Mocked Trip (Backend Offline)',
             startDate: new Date().toISOString(),
             endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
             description: 'This is a mock trip because the backend is currently offline.',
             stops: []
          };
        }
        throw err;
      }
    },
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-pulse text-textSecondary">Loading itinerary...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 text-center">
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Trip Not Found</h2>
        <p className="text-textSecondary mb-6">We couldn't load this itinerary. It might have been deleted or you don't have access.</p>
        <Button onClick={() => navigate('/trips')} variant="secondary">
          Back to My Trips
        </Button>
      </div>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Trips
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary mb-2">{trip.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-textSecondary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                  </span>
                </div>
                {trip.description && (
                  <div className="flex items-center gap-1.5 max-w-md truncate">
                    <span className="truncate">{trip.description}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="secondary" onClick={() => navigate(`/trips/${id}`)}>
                Preview
              </Button>
              <Button onClick={() => navigate(`/trips/${id}/budget`)}>
                Budget
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Placeholder for AI Prompt Generator (Phase 4) */}
        {/* <PromptInputBox /> */}

        {/* Stops List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Itinerary Stops
            </h2>
          </div>
          
          {trip.stops && trip.stops.length > 0 ? (
            <div className="space-y-6">
              {/* Phase 3: Map through trip.stops and render StopCard components */}
              {trip.stops.map(stop => (
                <div key={stop.id} className="p-6 bg-surface rounded-xl shadow-soft border border-border">
                  Stop placeholder for {stop.city?.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl shadow-soft border border-border border-dashed">
              <MapPin className="w-12 h-12 text-textSecondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-textPrimary">Your trip is empty</h3>
              <p className="mt-1 text-textSecondary mb-6">Add your first destination to start planning.</p>
              
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Destination
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
