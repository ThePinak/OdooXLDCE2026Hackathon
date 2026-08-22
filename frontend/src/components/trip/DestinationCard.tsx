import React from 'react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';
import { Card } from '@/components/ui/Card';

interface DestinationCardProps {
  city: City;
  className?: string;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ 
  city, 
  className, 
  onClick,
  actionButton 
}) => {
  return (
    <Card 
      className={cn(`group relative overflow-hidden p-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30 border border-white/20 h-full w-full ${onClick ? 'cursor-pointer' : ''}`, className)}
      onClick={onClick}
    >
      <img 
        src={city.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'} 
        alt={city.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white group-hover:text-primary transition-colors drop-shadow-lg">
            {city.name}
          </h3>
          <p className="text-white/90 text-sm mt-1 font-medium drop-shadow-md">{city.country}</p>
        </div>
        {actionButton && (
          <div className="shrink-0 ml-2">
            {actionButton}
          </div>
        )}
      </div>
    </Card>
  );
};
