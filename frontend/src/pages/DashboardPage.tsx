import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Plane, Plus, Calendar, MapPin, Loader2, Globe, Trash2 } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImageUrl: string | null;
  publicSlug?: string | null;
  stops?: { city: { imageUrl: string } }[];
  user?: { name: string };
  _count: { stops: number };
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Trip State
  const [newTripName, setNewTripName] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const [userTrips, featured] = await Promise.all([
        api.get('/trips'),
        api.get('/share/featured/trips')
      ]);
      setTrips(userTrips.data);
      setFeaturedTrips(featured.data);
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await api.post('/trips', {
        name: newTripName,
        startDate: new Date(newTripStart).toISOString(),
        endDate: new Date(newTripEnd).toISOString()
      });
      setIsModalOpen(false);
      navigate(`/trips/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation(); // prevent navigating to trip
    if (!window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/trips/${tripId}`);
      // Refresh the trips list
      fetchTrips();
    } catch (error) {
      console.error('Failed to delete trip', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-page-bg relative font-sans text-brand-dark">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[100%] bg-brand-soft rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-6 z-50 max-w-7xl mx-auto px-6 py-4 rounded-3xl bg-glass backdrop-blur-xl border border-white/70 shadow-glass transition-all duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-brand-fresh text-white p-2 rounded-xl shadow-md">
              <Plane size={20} className="transform -rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-brand-gray font-medium hidden sm:inline-block">Hello, {user?.name}</span>
            <button 
              onClick={() => navigate('/profile')}
              className="text-brand-gray hover:text-brand-deep font-medium transition-colors"
            >
              Profile
            </button>
            <button 
              onClick={() => logout()}
              className="text-brand-gray hover:text-brand-deep font-medium transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 mt-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Trips</h1>
            <p className="text-brand-gray">Manage your upcoming adventures and AI itineraries.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-deep text-white px-6 py-3 rounded-full shadow-md hover:bg-brand-fresh hover:shadow-lg hover:-translate-y-1 transition-all flex items-center space-x-2 font-semibold"
          >
            <Plus size={20} />
            <span>New Trip</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-fresh" size={40} />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Templates Section */}
            {featuredTrips.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-brand-mint text-brand-deep p-1.5 rounded-lg">
                    <Globe size={18} />
                  </div>
                  <h2 className="text-2xl font-bold">Featured Templates</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredTrips.map(trip => (
                    <div 
                      key={trip.id} 
                      onClick={() => navigate(`/share/${trip.publicSlug}`)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-glass hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 group relative"
                    >
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-brand-deep text-xs font-bold px-2 py-1 rounded-lg z-10 shadow-sm">
                        Template
                      </div>
                      <div className="h-40 bg-brand-soft relative overflow-hidden">
                        {(trip.coverImageUrl || trip.stops?.[0]?.city?.imageUrl) ? (
                          <img src={trip.coverImageUrl || trip.stops?.[0]?.city?.imageUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-mint/40 to-brand-soft">
                            <Plane size={48} className="text-brand-deep/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 text-white">
                          <h3 className="font-bold text-lg drop-shadow-md leading-tight line-clamp-2">{trip.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between text-sm text-brand-gray mb-1">
                          <span className="flex items-center"><MapPin size={14} className="mr-1" /> {trip._count?.stops || 0} Stops</span>
                          <span>By {trip.user?.name || 'GlobeTrotter'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Private Trips Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Your Itineraries</h2>
              {trips.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-lg border border-white/70 rounded-3xl p-16 text-center shadow-glass flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-brand-mint text-brand-deep rounded-full flex items-center justify-center mb-6">
                    <Plane size={32} className="transform -rotate-45" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No trips planned yet.</h3>
                  <p className="text-brand-gray mb-8 max-w-md">Your itinerary list is completely empty. Start exploring the world by creating your first trip.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-deep text-white px-8 py-3 rounded-full shadow-md hover:bg-brand-fresh transition-all font-semibold"
                  >
                    Create Your First Trip
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trips.map(trip => (
                    <div 
                      key={trip.id} 
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-glass hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 group"
                    >
                      <div className="h-48 bg-brand-soft relative overflow-hidden">
                        {(trip.coverImageUrl || trip.stops?.[0]?.city?.imageUrl) ? (
                          <img src={trip.coverImageUrl || trip.stops?.[0]?.city?.imageUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-deep opacity-30">
                            <Plane size={64} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleDeleteTrip(e, trip.id)}
                            className="bg-white/90 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-full backdrop-blur shadow-sm transition-colors"
                            title="Delete Trip"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-xl drop-shadow-md">{trip.name}</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-2 text-brand-gray mb-3">
                          <Calendar size={16} />
                          <span className="text-sm font-medium">
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-brand-gray">
                          <MapPin size={16} />
                          <span className="text-sm font-medium">{trip._count?.stops || 0} Destinations</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-[float_0.3s_ease-out]">
            <h2 className="text-2xl font-bold mb-6">Plan a New Journey</h2>
            <form onSubmit={handleCreateTrip} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-1">Trip Name</label>
                <input 
                  type="text" 
                  required 
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  placeholder="e.g. Summer in Tokyo"
                  className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newTripStart}
                    onChange={(e) => setNewTripStart(e.target.value)}
                    className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newTripEnd}
                    onChange={(e) => setNewTripEnd(e.target.value)}
                    className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-brand-gray font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="bg-brand-deep text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-fresh shadow-md transition-colors disabled:opacity-70"
                >
                  {isCreating ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
