import React from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, Trash2, MapPin } from 'lucide-react';
import type { Stop } from '@/types';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/trip/ActivityCard';

interface StopCardProps {
  stop: Stop;
  onAddActivity: (stopId: string, cityId: string) => void;
  onRemoveStop?: (stopId: string) => void;
  onRemoveActivity?: (stopActivityId: string) => void;
}

export const StopCard: React.FC<StopCardProps> = ({ 
  stop, 
  onAddActivity, 
  onRemoveStop,
  onRemoveActivity
}) => {
  const startDate = new Date(stop.startDate);
  const endDate = new Date(stop.endDate);

  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden flex flex-col">
      {/* Stop Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-background to-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
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
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {onRemoveStop && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemoveStop(stop.id)}
            className="text-textSecondary hover:text-red-500 hover:bg-red-50 self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Remove Stop
          </Button>
        )}
      </div>

      {/* Stop Activities */}
      <div className="p-6 bg-surface">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-textPrimary">Planned Activities</h4>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onAddActivity(stop.id, stop.cityId)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Activity
          </Button>
        </div>

        {stop.activities && stop.activities.length > 0 ? (
          <div className="space-y-4">
            {stop.activities.map(stopAct => (
              <ActivityCard 
                key={stopAct.id} 
                stopActivity={stopAct} 
                onRemove={onRemoveActivity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-background rounded-xl border border-border border-dashed">
            <p className="text-textSecondary mb-4">No activities planned for {stop.city?.name} yet.</p>
            <Button 
              variant="outline"
              onClick={() => onAddActivity(stop.id, stop.cityId)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Explore Activities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
