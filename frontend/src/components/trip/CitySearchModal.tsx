import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { City } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DestinationCard } from '@/components/trip/DestinationCard';
import { Button } from '@/components/ui/Button';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ['cities', 'search', searchTerm],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/cities', { params: { search: searchTerm } });
        return res.data;
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
           // Mock data if backend is offline
           const allMockCities = [
             { id: '1', name: 'Tokyo', country: 'Japan', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800' },
             { id: '2', name: 'Paris', country: 'France', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e90760b6164?auto=format&fit=crop&q=80&w=800' },
             { id: '3', name: 'Bali', country: 'Indonesia', costIndex: 2, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
             { id: '4', name: 'New York', country: 'USA', costIndex: 5, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800' },
             { id: '5', name: 'Rome', country: 'Italy', costIndex: 4, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800' },
           ];
           if (searchTerm) {
             return allMockCities.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
           }
           return allMockCities;
        }
        throw err;
      }
    },
    enabled: isOpen,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a Destination">
      <div className="space-y-6">
        <div className="relative">
          <Input 
            placeholder="Search for a city (e.g. Tokyo, Paris...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/3] bg-background rounded-xl animate-pulse" />
            ))}
          </div>
        ) : cities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cities.map(city => (
              <DestinationCard 
                key={city.id} 
                city={city} 
                onClick={() => onSelect(city)}
                actionButton={
                  <Button size="sm" className="gap-1.5 pointer-events-none">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-background rounded-xl border border-border border-dashed">
            <p className="text-textSecondary">No cities found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
