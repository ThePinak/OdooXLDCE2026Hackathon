import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Clock, DollarSign } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { Activity } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ActivitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityId: string | null;
  onSelect: (activity: Activity) => void;
}

export const ActivitySearchModal: React.FC<ActivitySearchModalProps> = ({ 
  isOpen, 
  onClose, 
  cityId,
  onSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['activities', cityId, searchTerm],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/activities', { params: { cityId, search: searchTerm } });
        return res.data;
      } catch (err: any) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
           // Mock data if backend is offline
           const allMockActivities = [
             { id: 'a1', cityId: '1', name: 'Shibuya Crossing & Hachiko', category: 'Sightseeing', cost: 0, duration: 1, imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e798b?auto=format&fit=crop&q=80&w=400' },
             { id: 'a2', cityId: '1', name: 'Tsukiji Fish Market Tour', category: 'Food', cost: 50, duration: 3, imageUrl: 'https://images.unsplash.com/photo-1583224956795-3df4dd990bc3?auto=format&fit=crop&q=80&w=400' },
             { id: 'a3', cityId: '2', name: 'Eiffel Tower Summit', category: 'Sightseeing', cost: 30, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=400' },
             { id: 'a4', cityId: '2', name: 'Louvre Museum Entry', category: 'Culture', cost: 20, duration: 4, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400' },
             { id: 'a5', cityId: '3', name: 'Ubud Monkey Forest', category: 'Nature', cost: 10, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400' },
             { id: 'a6', cityId: '4', name: 'Central Park Walk', category: 'Nature', cost: 0, duration: 2, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400' },
           ];
           
           // Filter by city first
           let filtered = allMockActivities;
           if (cityId) {
             filtered = filtered.filter(a => a.cityId === cityId);
           }
           
           // Then by search term
           if (searchTerm) {
             filtered = filtered.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
           }
           return filtered;
        }
        throw err;
      }
    },
    enabled: isOpen && !!cityId,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Activity" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <div className="relative">
          <Input 
            placeholder="Search activities, tours, dining..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-background rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map(activity => (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors"
              >
                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <img src={activity.imageUrl || ''} alt={activity.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-textPrimary truncate">{activity.name}</h4>
                  <div className="text-sm text-textSecondary mt-1">{activity.category}</div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm font-medium text-textPrimary">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-textSecondary" />
                      {activity.duration} hrs
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-textSecondary" />
                      {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
                    </div>
                  </div>
                </div>
                
                <div className="shrink-0 self-center">
                  <Button size="sm" onClick={() => onSelect(activity)}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-background rounded-xl border border-border border-dashed">
            <p className="text-textSecondary">No activities found matching "{searchTerm}" for this city.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
