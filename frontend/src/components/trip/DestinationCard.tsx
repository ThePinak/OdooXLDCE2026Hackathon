import React from 'react';
import { cn } from '@/lib/utils';
import type { City } from '@/types';

interface DestinationCardProps {
  city: City;
  onClick?: () => void;
  className?: string;
  actionButton?: React.ReactNode;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ 
  city, 
  onClick, 
  className,
  actionButton 
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3] shadow-soft",
        className
      )}
    >
      {/* Background Image */}
      {city.imageUrl ? (
        <img 
          src={city.imageUrl} 
          alt={city.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <span className="text-gray-400">No Image</span>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
        <div>
          <h3 className="text-white font-bold text-lg">{city.name}</h3>
          <p className="text-gray-300 text-sm">{city.country}</p>
        </div>
        
        {/* Optional Action Button (e.g., 'Add' button that appears on hover) */}
        {actionButton && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            {actionButton}
          </div>
        )}
      </div>

      {/* Cost Index Badge */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-textPrimary text-xs font-bold px-2 py-1 rounded-md shadow-sm">
        {'$'.repeat(city.costIndex || 1)}
      </div>
    </div>
  );
};
