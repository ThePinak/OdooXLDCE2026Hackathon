import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, MapPin, Copy, CheckCircle2, Globe2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { Trip } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export const PublicItineraryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [isCopied, setIsCopied] = useState(false);

  // Fetch the shared trip (in mock mode, we fallback to a standard trip)
  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: ['share', slug],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/share/${slug}`);
        return res.data;
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          // If offline, pretend we found a shared trip
          return {
             id: slug,
             name: "Shared Trip (Mock Mode)",
             startDate: new Date().toISOString(),
             endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
             description: "This is a public, read-only view of someone else's trip itinerary.",
             isPublic: true,
             stops: [
               {
                 id: 'stop-1',
                 city: { id: '1', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800' },
                 startDate: new Date().toISOString(),
                 endDate: new Date().toISOString(),
                 activities: [
                   { id: 'act-1', activity: { name: 'Tsukiji Fish Market Tour', category: 'Food', cost: 50, duration: 3 } }
                 ]
               }
             ]
          };
        }
        throw err;
      }
    },
    retry: 1,
  });

  const copyMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiClient.post(`/share/${slug}/copy`);
        return res.data;
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
           // Mock copy
           return { id: 'new-copied-trip' };
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      setIsCopied(true);
      setTimeout(() => {
        navigate(`/trips/${data.id}/builder`);
      }, 1500);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-pulse text-textSecondary">Loading shared itinerary...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 text-center">
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Trip Not Found</h2>
        <p className="text-textSecondary mb-6">This itinerary does not exist or is no longer public.</p>
        <Button onClick={() => navigate('/')} variant="secondary">
          Go Home
        </Button>
      </div>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Header */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gray-200">
          <img 
            src={trip.coverImageUrl || `https://images.unsplash.com/photo-1488646953014-c8c33136b66c?auto=format&fit=crop&q=80&w=1200`} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 w-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <Globe2 className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Public Itinerary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-border shadow-soft">
          <p className="text-textSecondary text-sm">
            {trip.description || "No description provided."}
          </p>
          
          <div className="shrink-0">
            {!isAuthenticated ? (
              <Button onClick={() => navigate('/login')} variant="secondary" className="w-full sm:w-auto">
                Sign in to save this trip
              </Button>
            ) : (
              <Button 
                onClick={() => copyMutation.mutate()} 
                disabled={copyMutation.isPending || isCopied}
                className={`w-full sm:w-auto ${isCopied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              >
                {isCopied ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied! Redirecting...</>
                ) : copyMutation.isPending ? (
                  'Copying...'
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy to My Trips</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Read-Only Stops Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-textPrimary mb-6">Destinations</h2>
          
          {trip.stops && trip.stops.length > 0 ? (
            <div className="space-y-8">
              {trip.stops.map(stop => (
                <div key={stop.id} className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden">
                  <div className="p-6 border-b border-border bg-gradient-to-r from-background to-surface">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-200">
                        {stop.city?.imageUrl ? (
                          <img src={stop.city.imageUrl} alt={stop.city.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-textPrimary">{stop.city?.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm font-medium text-textSecondary">
                          <span>
                            {format(new Date(stop.startDate), 'MMM d')} - {format(new Date(stop.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-background/50">
                    <h4 className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-4">Activities</h4>
                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="space-y-3">
                        {stop.activities.map(stopAct => (
                          <div key={stopAct.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                               <img src={stopAct.activity.imageUrl || ''} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h5 className="font-bold text-textPrimary text-sm">{stopAct.activity.name}</h5>
                              <p className="text-xs text-textSecondary">{stopAct.activity.duration} hrs • {stopAct.activity.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-textSecondary italic">No activities planned.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textSecondary">No destinations added to this trip.</p>
          )}
        </div>
      </div>
    </div>
  );
};
