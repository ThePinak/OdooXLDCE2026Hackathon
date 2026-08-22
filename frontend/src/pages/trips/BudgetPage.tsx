import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '@/lib/api-client';
import type { Trip } from '@/types';
import { Card } from '@/components/ui/Card';

const COLORS = ['#FF6B4A', '#0EA5E9', '#16A34A', '#F59E0B', '#8B5CF6'];

export const BudgetPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch the trip to compute budget if backend offline
  const { data: trip, isLoading: isLoadingTrip } = useQuery<Trip>({
    queryKey: ['trip', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/trips/${id}`);
        return res.data;
      } catch (err: any) {
        if (!err.response) {
          return { name: 'Mocked Trip (Backend Offline)', stops: [] };
        }
        throw err;
      }
    },
    retry: 1,
  });

  // Mock calculation if the backend `/budget` endpoint is offline
  const computedBudget = useMemo(() => {
    if (!trip || !trip.stops) return { totalCost: 0, byCategory: [], byStop: [] };

    let total = 0;
    const categoryMap: Record<string, number> = {};
    const stopMap: Record<string, number> = {};

    trip.stops.forEach(stop => {
      let stopTotal = 0;
      stop.activities?.forEach(stopAct => {
        const cost = stopAct.activity.cost || 0;
        const cat = stopAct.activity.category || 'Other';
        
        total += cost;
        stopTotal += cost;
        categoryMap[cat] = (categoryMap[cat] || 0) + cost;
      });
      stopMap[stop.city?.name || 'Unknown'] = stopTotal;
    });

    return {
      totalCost: total,
      byCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      byStop: Object.entries(stopMap).map(([name, value]) => ({ name, value }))
    };
  }, [trip]);

  // Actual Query for Budget
  const { data: budgetData, isLoading: isLoadingBudget } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/trips/${id}/budget`);
        return res.data;
      } catch (err: any) {
        if (!err.response) {
           return computedBudget;
        }
        throw err;
      }
    },
    enabled: !!trip,
  });

  const isLoading = isLoadingTrip || (isLoadingBudget && !budgetData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-pulse text-textSecondary">Loading budget analytics...</div>
      </div>
    );
  }

  const finalBudget = budgetData || computedBudget;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(`/trips/${id}/builder`)}
            className="flex items-center text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Builder
          </button>
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-textPrimary">Trip Budget Analytics</h1>
          </div>
          <p className="mt-2 text-textSecondary text-lg">
            {trip?.name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Total Cost Summary */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none text-white text-center py-10 shadow-lg">
          <h2 className="text-lg font-medium opacity-90 mb-2">Estimated Activity Cost</h2>
          <div className="text-6xl font-bold font-sans tracking-tight">
            ${finalBudget.totalCost}
          </div>
          <p className="mt-4 text-sm opacity-80 max-w-md mx-auto">
            This represents the combined cost of all planned activities. Flights and accommodation are currently not tracked.
          </p>
        </Card>

        {finalBudget.totalCost > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Pie Chart */}
            <Card className="p-6 h-96 flex flex-col">
              <h3 className="text-lg font-bold text-textPrimary mb-4">Cost by Category</h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalBudget.byCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {finalBudget.byCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value}`, 'Cost']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {finalBudget.byCategory.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-sm font-medium text-textSecondary">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </Card>

            {/* Stop Bar Chart */}
            <Card className="p-6 h-96 flex flex-col">
              <h3 className="text-lg font-bold text-textPrimary mb-4">Cost by Destination</h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finalBudget.byStop} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value}`, 'Cost']}
                      cursor={{ fill: 'var(--surface)', opacity: 0.5 }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-xl border border-border border-dashed">
            <Wallet className="w-12 h-12 text-textSecondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textPrimary">No costs calculated yet</h3>
            <p className="mt-1 text-textSecondary mb-6">Add paid activities to your itinerary to see the budget breakdown.</p>
            <Button onClick={() => navigate(`/trips/${id}/builder`)} variant="secondary">
              Go to Itinerary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
