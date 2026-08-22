import React from 'react';
import { Clock, DollarSign, Trash2 } from 'lucide-react';
import type { StopActivity } from '@/types';

interface ActivityCardProps {
  stopActivity: StopActivity;
  onRemove?: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ stopActivity, onRemove }) => {
  const { activity, timeSlot } = stopActivity;

  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
      {/* Activity Image */}
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {activity.imageUrl ? (
          <img 
            src={activity.imageUrl} 
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textSecondary text-xs">
            No img
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="text-base font-bold text-textPrimary truncate pr-4">
            {activity.name}
          </h4>
          
          {onRemove && (
            <button 
              onClick={() => onRemove(stopActivity.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-textSecondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all shrink-0"
              title="Remove activity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="text-sm text-textSecondary mt-1">
          {activity.category}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-textPrimary">
          {timeSlot && (
            <div className="flex items-center text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {timeSlot}
            </div>
          )}
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-textSecondary" />
            {activity.duration} hrs
          </div>
          
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-textSecondary" />
            {activity.cost}
          </div>
        </div>
      </div>
    </div>
  );
};
