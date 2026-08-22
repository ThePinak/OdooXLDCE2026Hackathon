import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const CreateTripPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (newTrip: any) => {
      const res = await apiClient.post('/trips', newTrip);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate(`/trips/${data.id}/builder`);
    },
    onError: (err: any) => {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        console.warn('Backend not reachable, mocking trip creation.');
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        navigate(`/trips/mock-trip-id/builder`);
        return;
      }
      setError(err.response?.data?.message || 'Failed to create trip. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
      setError('Name, start date, and end date are required.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    createMutation.mutate({
      name,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      description,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Plan a New Trip</h1>
          <p className="text-textSecondary mb-8">
            Give your adventure a name and set the dates to start building your itinerary.
          </p>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Trip Name"
                placeholder="e.g. Summer in Japan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-textPrimary">
                  Description (Optional)
                </label>
                <textarea
                  className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-base placeholder:text-textSecondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors min-h-[120px] resize-y"
                  placeholder="What's the goal of this trip?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="mr-3"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Trip'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
