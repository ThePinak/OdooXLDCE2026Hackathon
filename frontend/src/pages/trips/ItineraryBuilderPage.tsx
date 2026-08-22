import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '@/lib/api-client';
import type { Trip, City, Activity, Stop, StopActivity } from '@/types';
import { Button } from '@/components/ui/Button';
import { StopCard } from '@/components/trip/StopCard';
import { CitySearchModal } from '@/components/trip/CitySearchModal';
import { ActivitySearchModal } from '@/components/trip/ActivitySearchModal';
import { AIPromptGenerator } from '@/components/trip/AIPromptGenerator';

export const ItineraryBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [activityModalContext, setActivityModalContext] = useState<{ stopId: string, cityId: string } | null>(null);

  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: ['trip', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/trips/${id}`);
        return res.data;
      } catch (err: any) {
        if (!err.response) {
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

  // Add Stop Mutation
  const addStopMutation = useMutation({
    mutationFn: async (city: City) => {
      try {
        const res = await apiClient.post(`/trips/${id}/stops`, {
          cityId: city.id,
          startDate: trip?.startDate,
          endDate: trip?.endDate
        });
        return res.data;
      } catch (err: any) {
        if (!err.response) {
           // Mock Add
           const mockStop: Stop = {
             id: uuidv4(),
             tripId: id!,
             cityId: city.id,
             startDate: trip?.startDate || new Date().toISOString(),
             endDate: trip?.endDate || new Date().toISOString(),
             orderIndex: trip?.stops?.length || 0,
             city: city,
             activities: []
           };
           return mockStop;
        }
        throw err;
      }
    },
    onSuccess: (newStop) => {
      setIsCityModalOpen(false);
      queryClient.setQueryData<Trip>(['trip', id], (old) => {
        if (!old) return old;
        return { ...old, stops: [...(old.stops || []), newStop] };
      });
    }
  });

  // Remove Stop Mutation
  const removeStopMutation = useMutation({
    mutationFn: async (stopId: string) => {
      try {
        await apiClient.delete(`/stops/${stopId}`);
      } catch (err: any) {
        if (!err.response) {
           return stopId;
        }
        throw err;
      }
    },
    onSuccess: (_, stopId) => {
      queryClient.setQueryData<Trip>(['trip', id], (old) => {
        if (!old) return old;
        return { ...old, stops: old.stops?.filter(s => s.id !== stopId) };
      });
    }
  });

  // Add Activity Mutation
  const addActivityMutation = useMutation({
    mutationFn: async ({ stopId, activity }: { stopId: string, activity: Activity }) => {
      try {
        const res = await apiClient.post(`/stops/${stopId}/activities`, {
          activityId: activity.id
        });
        return { stopId, stopActivity: res.data };
      } catch (err: any) {
        if (!err.response) {
           const mockStopActivity: StopActivity = {
             id: uuidv4(),
             stopId: stopId,
             activityId: activity.id,
             dayNumber: null,
             timeSlot: null,
             activity: activity
           };
           return { stopId, stopActivity: mockStopActivity };
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      setActivityModalContext(null);
      queryClient.setQueryData<Trip>(['trip', id], (old) => {
        if (!old) return old;
        const newStops = old.stops?.map(stop => {
          if (stop.id === data.stopId) {
            return { ...stop, activities: [...(stop.activities || []), data.stopActivity] };
          }
          return stop;
        });
        return { ...old, stops: newStops };
      });
    }
  });

  // Remove Activity Mutation
  const removeActivityMutation = useMutation({
    mutationFn: async (stopActivityId: string) => {
      try {
        await apiClient.delete(`/stop-activities/${stopActivityId}`);
      } catch (err: any) {
        if (!err.response) {
           return stopActivityId; // mock success
        }
        throw err;
      }
    },
    onSuccess: (_, stopActivityId) => {
      queryClient.setQueryData<Trip>(['trip', id], (old) => {
        if (!old) return old;
        const newStops = old.stops?.map(stop => {
          return {
            ...stop,
            activities: stop.activities?.filter(a => a.id !== stopActivityId)
          };
        });
        return { ...old, stops: newStops };
      });
    }
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
              <Button variant="secondary" onClick={() => navigate(`/share/${id}`)}>
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
        
        <AIPromptGenerator trip={trip} />

        {/* Stops List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Itinerary Stops
            </h2>
            {trip.stops && trip.stops.length > 0 && (
              <Button size="sm" onClick={() => setIsCityModalOpen(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> Add Destination
              </Button>
            )}
          </div>
          
          {trip.stops && trip.stops.length > 0 ? (
            <div className="space-y-8">
              {trip.stops.map(stop => (
                <StopCard 
                  key={stop.id} 
                  stop={stop}
                  onAddActivity={(stopId, cityId) => setActivityModalContext({ stopId, cityId })}
                  onRemoveStop={(stopId) => {
                    if (window.confirm('Are you sure you want to remove this stop?')) {
                      removeStopMutation.mutate(stopId);
                    }
                  }}
                  onRemoveActivity={(stopActivityId) => removeActivityMutation.mutate(stopActivityId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-xl shadow-soft border border-border border-dashed">
              <MapPin className="w-12 h-12 text-textSecondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-textPrimary">Your trip is empty</h3>
              <p className="mt-1 text-textSecondary mb-6">Add your first destination to start planning.</p>
              
              <Button onClick={() => setIsCityModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Destination
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CitySearchModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)}
        onSelect={(city) => {
          addStopMutation.mutate(city);
        }}
      />

      <ActivitySearchModal 
        isOpen={!!activityModalContext}
        onClose={() => setActivityModalContext(null)}
        cityId={activityModalContext?.cityId || null}
        onSelect={(activity) => {
          if (activityModalContext) {
            addActivityMutation.mutate({ stopId: activityModalContext.stopId, activity });
          }
        }}
      />
    </div>
  );
};
