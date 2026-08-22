import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Edit3, Trash2, Share2, CheckCircle2 } from 'lucide-react';
import type { Trip } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, showActions = false }) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const stopCount = trip._count?.stops || trip.stops?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 group flex flex-col justify-between h-full p-0 overflow-hidden">
      <Link to={`/trips/${trip.id}`} className="block flex-grow cursor-pointer">
        <div className="relative h-40 w-full bg-gray-200 overflow-hidden">
          <img 
            src={trip.coverImageUrl || `https://images.unsplash.com/photo-[RANDOM_ID]?auto=format&fit=crop&q=80&w=800`.replace('[RANDOM_ID]', ['1503899036084-c55cdd92da26', '1502602898657-3e90760b6164', '1537996194471-e657df975ab4', '1493976040374-85c8e12f0c0e'][Math.floor(Math.random() * 4)])} 
            alt={trip.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-textPrimary group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {trip.name}
          </h3>
        
        <div className="flex flex-col gap-2 mt-4 text-textSecondary text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span>
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>{stopCount} {stopCount === 1 ? 'Stop' : 'Stops'}</span>
          </div>
        </div>
        </div>
      </Link>

      {showActions && (
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-textSecondary hover:text-primary"
            onClick={() => {
              // Mock share URL generation
              const shareUrl = `${window.location.origin}/share/${trip.id}`;
              navigator.clipboard.writeText(shareUrl);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }}
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Share2 className="w-4 h-4 mr-1" />}
            {isCopied ? 'Copied' : 'Share'}
          </Button>
          <Link to={`/trips/${trip.id}/builder`}>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-textSecondary hover:text-primary">
              <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
          </Link>
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-textSecondary hover:text-red-500 hover:bg-red-50"
              onClick={() => onDelete(trip.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
