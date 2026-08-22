import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Plane, Calendar, MapPin, Clock, DollarSign, Copy, Loader2, Share2 } from 'lucide-react';

export default function PublicTripPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicTrip();
  }, [slug]);

  const fetchPublicTrip = async () => {
    try {
      const response = await api.get(`/share/${slug}`);
      setTrip(response.data);
    } catch (err: any) {
      console.error('Failed to fetch public trip', err);
      setError('This trip could not be found or is no longer public.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClone = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setIsCloning(true);
    try {
      const response = await api.post(`/share/${slug}/copy`);
      navigate(`/trips/${response.data.tripId}`);
    } catch (err) {
      console.error('Failed to clone trip', err);
      alert('Failed to clone trip. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-deep" size={48} />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center font-sans text-brand-dark p-6">
        <div className="bg-white p-12 rounded-3xl shadow-glass border border-white/70 text-center max-w-md">
          <Plane size={48} className="mx-auto text-brand-muted mb-4 transform -rotate-45" />
          <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
          <p className="text-brand-gray mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-brand-deep text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-fresh transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg relative font-sans text-brand-dark pb-24">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-50%] left-[-10%] w-[80%] h-[120%] bg-brand-soft rounded-full mix-blend-multiply filter blur-[150px] opacity-60"></div>
      </div>

      <nav className="sticky top-6 z-50 max-w-5xl mx-auto px-6 py-4 rounded-3xl bg-glass backdrop-blur-xl border border-white/70 shadow-glass transition-all duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-brand-fresh text-white p-2 rounded-xl shadow-md">
              <Plane size={20} className="transform -rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleShare}
              className="bg-white border border-gray-100 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all flex items-center text-brand-dark"
            >
              <Share2 size={16} className="mr-2" />
              Copy Link
            </button>
            <button 
              onClick={handleClone}
              disabled={isCloning}
              className="bg-brand-deep text-white px-5 py-2 rounded-full font-medium shadow-md hover:bg-brand-fresh transition-all flex items-center disabled:opacity-70"
            >
              {isCloning ? <Loader2 size={16} className="animate-spin mr-2" /> : <Copy size={16} className="mr-2" />}
              {isAuthenticated ? 'Clone to My Trips' : 'Sign in to Clone'}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-16">
        <div className="text-center mb-16">
          <span className="inline-flex items-center bg-brand-mint text-brand-deep px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-brand-soft">
             Shared Itinerary by {trip.user.name}
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">{trip.name}</h1>
          <div className="flex items-center justify-center space-x-6 text-brand-gray">
            <div className="flex items-center space-x-2">
              <Calendar size={18} />
              <span className="font-medium">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={18} />
              <span className="font-medium">{trip.stops.length} Destinations</span>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {trip.stops.map((stop: any, index: number) => (
            <div key={stop.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                 <div>
                   <h3 className="text-3xl font-bold text-brand-dark flex items-center">
                     <span className="bg-brand-deep text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">{index + 1}</span>
                     {stop.city.name}
                   </h3>
                   <p className="text-brand-gray ml-11">{stop.city.country}</p>
                 </div>
                 <div className="text-sm font-medium text-brand-muted mt-2 md:mt-0 bg-page-bg px-3 py-1 rounded-lg">
                   {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                 </div>
               </div>

               <img src={stop.city.imageUrl} alt={stop.city.name} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm" />

               {stop.activities.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {stop.activities.map((mapping: any) => (
                     <div key={mapping.id} className="flex items-start p-4 bg-page-bg rounded-2xl border border-gray-100">
                       <img src={mapping.activity.imageUrl} alt={mapping.activity.name} className="w-16 h-16 rounded-xl object-cover mr-4" />
                       <div className="flex-1">
                         <h4 className="font-bold text-brand-dark mb-1">{mapping.activity.name}</h4>
                         <div className="flex items-center space-x-4 text-xs font-semibold text-brand-gray">
                           <span className="flex items-center"><Clock size={14} className="mr-1"/> {mapping.activity.durationMinutes}m</span>
                           <span className="flex items-center"><DollarSign size={14} className="mr-1"/> ${mapping.activity.cost}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-brand-gray text-center py-4 bg-page-bg rounded-2xl">No specific activities planned here yet.</p>
               )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center pb-12">
           <h3 className="text-2xl font-bold mb-4">Want to experience this trip?</h3>
           <button 
              onClick={handleClone}
              disabled={isCloning}
              className="bg-brand-deep text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-brand-fresh hover:-translate-y-1 transition-all disabled:opacity-70 text-lg"
            >
              {isCloning ? 'Cloning to your workspace...' : 'Clone this Itinerary'}
            </button>
        </div>
      </main>
    </div>
  );
}
