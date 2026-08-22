import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Plane, Calendar, MapPin, Sparkles, Plus, Trash2, ChevronLeft, Loader2, Clock, DollarSign, PieChart, Share2, Globe, Lock } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import { Country, City as CSCity } from 'country-state-city';

export default function TripWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stop Selection Modal
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [stopStart, setStopStart] = useState('');
  const [stopEnd, setStopEnd] = useState('');
  const [isCountryLocked, setIsCountryLocked] = useState(false);

  // Activity Selection Modal
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState('');
  const [activeCityId, setActiveCityId] = useState('');
  const [cityActivities, setCityActivities] = useState<any[]>([]);
  
  // Custom Activity State
  const [isCreatingCustomActivity, setIsCreatingCustomActivity] = useState(false);
  const [customActivity, setCustomActivity] = useState({ name: '', category: 'sightseeing', cost: 0, duration: 60 });
  
  // UI State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  // Phase 5: Budget & Social
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Advanced Budget States
  const [flightCost, setFlightCost] = useState(0);
  const [accommodationCost, setAccommodationCost] = useState(0);
  const [miscCost, setMiscCost] = useState(0);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);

  useEffect(() => {
    fetchTripData();
    fetchCities();
  }, [id]);

  useEffect(() => {
    if (isAddStopOpen && trip && trip.stops.length > 0) {
      const existingCountryName = trip.stops[0].city.country;
      const matchedCountry = Country.getAllCountries().find(c => c.name === existingCountryName);
      if (matchedCountry) {
        setSelectedCountryCode(matchedCountry.isoCode);
        setIsCountryLocked(true);
      }
    } else if (isAddStopOpen) {
      setIsCountryLocked(false);
    }
  }, [isAddStopOpen, trip]);

  const fetchTripData = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
      setFlightCost(response.data.flightCost || 0);
      setAccommodationCost(response.data.accommodationCost || 0);
      setMiscCost(response.data.miscCost || 0);
    } catch (error) {
      console.error('Failed to fetch trip', error);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data);
    } catch (error) {
      console.error('Failed to fetch cities', error);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityName) return;
    try {
      // 1. Generate or fetch the city ID from the selected name
      const cityRes = await api.post('/cities/generate', { name: selectedCityName });
      const actualCityId = cityRes.data.id;

      // 2. Add the stop using the actual city ID
      await api.post(`/trips/${id}/stops`, {
        cityId: actualCityId,
        startDate: new Date(stopStart).toISOString(),
        endDate: new Date(stopEnd).toISOString()
      });
      setIsAddStopOpen(false);
      setTrip(null); // trigger loading state
      setIsLoading(true);
      fetchTripData();
    } catch (error) {
      console.error('Failed to add stop', error);
      alert('Failed to add destination. Please try again.');
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!window.confirm('Remove this destination?')) return;
    try {
      await api.delete(`/stops/${stopId}`);
      fetchTripData();
    } catch (error) {
      console.error('Failed to delete stop', error);
    }
  };

  const openAddActivity = async (stopId: string, cityId: string) => {
    setActiveStopId(stopId);
    setActiveCityId(cityId);
    setIsCreatingCustomActivity(false);
    try {
      const response = await api.get(`/activities?cityId=${cityId}`);
      setCityActivities(response.data);
      setIsAddActivityOpen(true);
    } catch (error) {
      console.error('Failed to fetch activities', error);
    }
  };

  const handleAddActivity = async (activityId: string) => {
    try {
      await api.post(`/stops/${activeStopId}/activities`, {
        activityId,
        dayNumber: 1
      });
      setIsAddActivityOpen(false);
      fetchTripData();
    } catch (error) {
      console.error('Failed to add activity', error);
    }
  };

  const handleCreateCustomActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create activity attached to city
      const actRes = await api.post(`/activities`, {
        cityId: activeCityId,
        name: customActivity.name,
        category: customActivity.category,
        cost: customActivity.cost,
        duration: Math.ceil(customActivity.duration / 60)
      });
      // Add it to stop
      await handleAddActivity(actRes.data.id);
    } catch (error) {
      console.error('Failed to create custom activity', error);
    }
  };

  const handleGenerateItinerary = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      await api.post(`/trips/${id}/generate-itinerary`, { prompt: aiPrompt });
      setAiPrompt('');
      await fetchTripData();
    } catch (error: any) {
      console.error('Failed to generate itinerary', error);
      const backendError = error.response?.data?.error;
      const backendMsg = error.response?.data?.message;
      alert(`AI generation failed: ${backendError || backendMsg || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePublish = async () => {
    setIsPublishing(true);
    try {
      await api.patch(`/trips/${id}/publish`);
      await fetchTripData();
    } catch (error) {
      console.error('Failed to toggle publish status', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-deep" size={48} />
      </div>
    );
  }

  // Calculate Budget Data
  const activityCost = trip.stops.reduce((sum: number, stop: any) => {
    return sum + stop.activities.reduce((s: number, act: any) => s + act.activity.cost, 0);
  }, 0);

  const budgetData = [
    { name: 'Activities', value: activityCost },
    { name: 'Flights', value: flightCost },
    { name: 'Accommodation', value: accommodationCost },
    { name: 'Misc', value: miscCost }
  ].filter((item) => item.value > 0);

  const totalTripCost = budgetData.reduce((sum: number, item: any) => sum + item.value, 0);
  const COLORS = ['#2F7D4A', '#4CAF64', '#81C784', '#A5D6A7', '#C8E6C9'];

  const handleUpdateBudget = async () => {
    setIsUpdatingBudget(true);
    try {
      await api.patch(`/trips/${trip.id}`, {
        flightCost,
        accommodationCost,
        miscCost
      });
      fetchTripData();
    } catch (error) {
      console.error('Failed to update budget', error);
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg relative font-sans text-brand-dark pb-24">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-50%] left-[-10%] w-[80%] h-[120%] bg-brand-soft rounded-full mix-blend-multiply filter blur-[150px] opacity-60"></div>
      </div>

      {/* Workspace Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-brand-gray hover:text-brand-dark">
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight">{trip.name}</h1>
                {trip.isPublic ? (
                  <span className="flex items-center text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    <Globe size={12} className="mr-1" /> Public
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    <Lock size={12} className="mr-1" /> Private
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-brand-gray mt-0.5">
                <Calendar size={14} />
                <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsBudgetOpen(true)}
              className="bg-white border border-gray-200 text-brand-dark px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all flex items-center"
            >
              <PieChart size={16} className="mr-2" />
              Budget
            </button>
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200/50">
               <button 
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm ${viewMode === 'timeline' ? 'bg-white shadow-sm text-brand-deep' : 'text-brand-gray hover:text-brand-dark'}`}
               >
                 Timeline
               </button>
               <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm ${viewMode === 'calendar' ? 'bg-white shadow-sm text-brand-deep' : 'text-brand-gray hover:text-brand-dark'}`}
               >
                 Calendar
               </button>
            </div>
            <button 
              onClick={togglePublish}
              disabled={isPublishing}
              className={`border px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all flex items-center ${trip.isPublic ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-gray-200 text-brand-dark'}`}
            >
              <Share2 size={16} className="mr-2" />
              {trip.isPublic ? 'Unpublish' : 'Publish Trip'}
            </button>
            {trip.isPublic && trip.publicSlug && (
               <button 
                 onClick={() => window.open(`/share/${trip.publicSlug}`, '_blank')}
                 className="bg-brand-deep text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-brand-fresh transition-all flex items-center"
               >
                 View Public Page
               </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: The Planner / AI Mode Toggle */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-glass backdrop-blur-xl border border-white/70 shadow-glass rounded-3xl p-6">
             <div className="flex bg-white/50 rounded-full p-1 mb-6 border border-gray-200/50">
               <button 
                  onClick={() => setIsAiMode(true)}
                  className={`flex-1 flex justify-center items-center space-x-2 py-3 rounded-full font-semibold transition-all ${isAiMode ? 'bg-white shadow-sm text-brand-deep' : 'text-brand-gray hover:text-brand-dark'}`}
               >
                 <Sparkles size={16} />
                 <span>AI Planner</span>
               </button>
               <button 
                  onClick={() => setIsAiMode(false)}
                  className={`flex-1 flex justify-center items-center space-x-2 py-3 rounded-full font-semibold transition-all ${!isAiMode ? 'bg-white shadow-sm text-brand-deep' : 'text-brand-gray hover:text-brand-dark'}`}
               >
                 <MapPin size={16} />
                 <span>Manual</span>
               </button>
             </div>

             {isAiMode ? (
               <div className="space-y-4">
                 <div className="flex items-center space-x-3 mb-2">
                   <div className="w-10 h-10 bg-brand-mint text-brand-deep rounded-full flex items-center justify-center">
                     <Sparkles size={20} />
                   </div>
                   <h3 className="font-bold text-lg">Generate Itinerary</h3>
                 </div>
                 <p className="text-brand-gray text-sm mb-4">Describe your dream trip. AI will automatically select cities, dates, and activities based on your preferences.</p>
                 <textarea 
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   disabled={isGenerating}
                   placeholder="e.g. A romantic week in Europe focusing on art history and wine tasting..."
                   className="w-full h-32 bg-white/80 border border-gray-200 rounded-2xl p-4 text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-fresh/50 resize-none shadow-sm"
                 />
                 <button 
                   onClick={handleGenerateItinerary}
                   disabled={isGenerating || !aiPrompt}
                   className={`w-full font-semibold py-4 rounded-2xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 
                    ${isGenerating ? 'bg-brand-soft text-brand-deep animate-pulse' : 'bg-brand-deep text-white hover:bg-brand-fresh disabled:opacity-50'}`}
                 >
                   {isGenerating ? (
                     <>
                       <Loader2 size={18} className="animate-spin" />
                       <span>Designing your trip...</span>
                     </>
                   ) : (
                     <>
                       <Sparkles size={18} />
                       <span>Generate Magic</span>
                     </>
                   )}
                 </button>
                 {isGenerating && (
                    <div className="text-center mt-2">
                      <p className="text-xs text-brand-muted animate-pulse">Please wait while Gemini generates a customized journey. This may take up to 20 seconds.</p>
                    </div>
                 )}
               </div>
             ) : (
               <div className="space-y-4">
                 <button 
                    onClick={() => setIsAddStopOpen(true)}
                    className="w-full bg-white border-2 border-dashed border-gray-300 text-brand-dark font-semibold py-6 rounded-2xl hover:border-brand-deep hover:bg-brand-mint transition-all flex flex-col items-center justify-center space-y-2 group"
                 >
                    <div className="bg-gray-100 p-2 rounded-full group-hover:bg-brand-soft group-hover:text-brand-deep transition-colors">
                      <Plus size={20} />
                    </div>
                    <span>Add Destination</span>
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-8">
           {trip.stops.length === 0 ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-white/40 backdrop-blur-sm">
                <Plane size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">Your itinerary is empty</h3>
                <p className="text-gray-400 max-w-sm">Use the panel on the left to add destinations manually or let AI generate them for you.</p>
             </div>
           ) : viewMode === 'timeline' ? (
             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {trip.stops.map((stop: any, index: number) => (
                  <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     
                     {/* Timeline Node */}
                     <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-page-bg bg-brand-deep text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                       <span className="font-bold">{index + 1}</span>
                     </div>
                     
                     {/* Stop Card */}
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-glass transition-all">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <h3 className="font-extrabold text-2xl text-brand-dark">{stop.city.name}</h3>
                           <p className="text-brand-gray text-sm">{stop.city.country}</p>
                         </div>
                         <button onClick={() => handleDeleteStop(stop.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                           <Trash2 size={18} />
                         </button>
                       </div>

                       <img src={stop.city.imageUrl} alt={stop.city.name} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-sm" />
                       
                       {/* Activities List */}
                       <div className="space-y-3 mb-4">
                         {stop.activities.map((mapping: any) => (
                           <div key={mapping.id} className="flex items-start p-3 bg-brand-mint/50 rounded-xl border border-brand-soft">
                             <img src={mapping.activity.imageUrl} alt={mapping.activity.name} className="w-12 h-12 rounded-lg object-cover mr-3" />
                             <div className="flex-1">
                               <h4 className="font-semibold text-sm">{mapping.activity.name}</h4>
                               <div className="flex items-center space-x-3 mt-1 text-xs text-brand-gray">
                                 <span className="flex items-center"><Clock size={12} className="mr-1"/> {mapping.activity.durationMinutes}m</span>
                                 <span className="flex items-center"><DollarSign size={12} className="mr-1"/> ${mapping.activity.cost}</span>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>

                       <button 
                         onClick={() => openAddActivity(stop.id, stop.city.id)}
                         className="w-full py-3 border border-gray-200 rounded-xl text-brand-deep font-semibold text-sm hover:bg-brand-soft transition-colors flex items-center justify-center"
                       >
                         <Plus size={16} className="mr-1" /> Add Activity
                       </button>
                     </div>

                  </div>
                ))}
             </div>
           ) : (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 overflow-x-auto h-full">
               <div className="flex gap-4 min-w-max pb-4">
                 {trip.stops.map((stop: any) => {
                   const days = Math.max(1, Math.ceil((new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / (1000 * 60 * 60 * 24)));
                   return Array.from({ length: days }).map((_, i) => (
                     <div key={`${stop.id}-day-${i+1}`} className="w-80 shrink-0">
                       <div className="bg-brand-mint/30 border border-brand-soft rounded-t-2xl p-4 text-center">
                         <h4 className="font-bold text-brand-deep">{stop.city.name}</h4>
                         <p className="text-xs text-brand-gray font-medium">Day {i + 1}</p>
                       </div>
                       <div className="bg-page-bg border-x border-b border-gray-200 rounded-b-2xl p-4 min-h-[300px] space-y-3">
                         {stop.activities.filter((a: any) => a.dayNumber === i + 1).map((mapping: any) => (
                           <div key={mapping.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-brand-soft transition-colors">
                             <div className="flex justify-between items-start mb-2">
                               <h5 className="font-semibold text-sm line-clamp-2">{mapping.activity.name}</h5>
                             </div>
                             <div className="flex items-center space-x-2 text-xs text-brand-gray">
                               <span className="flex items-center bg-gray-50 px-2 py-1 rounded"><Clock size={10} className="mr-1"/> {mapping.activity.durationMinutes || mapping.activity.duration * 60}m</span>
                             </div>
                           </div>
                         ))}
                         {stop.activities.filter((a: any) => a.dayNumber === i + 1).length === 0 && (
                           <div className="text-center py-8 text-brand-gray/50 text-sm italic">Free time</div>
                         )}
                       </div>
                     </div>
                   ));
                 })}
               </div>
             </div>
           )}
        </div>
      </main>

      {/* Add Stop Modal (Unchanged) */}
      {isAddStopOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsAddStopOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-[float_0.3s_ease-out]">
            <h2 className="text-2xl font-bold mb-6">Add Destination</h2>
            <form onSubmit={handleAddStop} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Country</label>
                  <select 
                    required
                    disabled={isCountryLocked}
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      setSelectedCityName('');
                    }}
                    className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50 shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>Select Country</option>
                    {Country.getAllCountries().map(c => (
                      <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">City</label>
                  <select 
                    required
                    disabled={!selectedCountryCode}
                    value={selectedCityName}
                    onChange={(e) => setSelectedCityName(e.target.value)}
                    className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50 shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>Select City</option>
                    {CSCity.getCitiesOfCountry(selectedCountryCode)?.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Arrival Date</label>
                  <input type="date" min={trip?.startDate ? trip.startDate.split('T')[0] : undefined} max={trip?.endDate ? trip.endDate.split('T')[0] : undefined} required value={stopStart} onChange={(e) => setStopStart(e.target.value)} className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Departure Date</label>
                  <input type="date" min={stopStart || (trip?.startDate ? trip.startDate.split('T')[0] : undefined)} max={trip?.endDate ? trip.endDate.split('T')[0] : undefined} required value={stopEnd} onChange={(e) => setStopEnd(e.target.value)} className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddStopOpen(false)} className="px-5 py-2.5 rounded-full text-brand-gray font-medium hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-deep text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-fresh shadow-md transition-colors">Add to Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsAddActivityOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 relative z-10 animate-[float_0.3s_ease-out] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isCreatingCustomActivity ? 'Create Custom Activity' : 'Discover Activities'}</h2>
              <button 
                onClick={() => setIsCreatingCustomActivity(!isCreatingCustomActivity)}
                className="text-sm font-semibold text-brand-deep hover:text-brand-fresh transition-colors"
              >
                {isCreatingCustomActivity ? 'View AI Suggestions' : '+ Add Custom Activity'}
              </button>
            </div>

            {isCreatingCustomActivity ? (
              <form onSubmit={handleCreateCustomActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Activity Name</label>
                  <input type="text" required value={customActivity.name} onChange={e => setCustomActivity({...customActivity, name: e.target.value})} className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" placeholder="e.g. Dinner at local restaurant" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-1">Category</label>
                    <select value={customActivity.category} onChange={e => setCustomActivity({...customActivity, category: e.target.value})} className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50">
                      <option value="sightseeing">Sightseeing</option>
                      <option value="food">Food</option>
                      <option value="culture">Culture</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-1">Cost ($)</label>
                    <input type="number" required min="0" value={customActivity.cost} onChange={e => setCustomActivity({...customActivity, cost: Number(e.target.value)})} className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-1">Duration (min)</label>
                    <input type="number" required min="15" step="15" value={customActivity.duration} onChange={e => setCustomActivity({...customActivity, duration: Number(e.target.value)})} className="w-full bg-page-bg border border-gray-200 rounded-xl py-3 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-brand-deep text-white py-3 rounded-xl font-medium shadow-sm hover:bg-brand-fresh transition-all">Add Custom Activity to Itinerary</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cityActivities.length === 0 ? (
                  <p className="col-span-2 text-brand-gray text-center py-8">No activities found for this city.</p>
                ) : (
                  cityActivities.map(act => (
                    <div key={act.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-brand-fresh transition-colors flex flex-col group">
                      <div className="h-32 overflow-hidden relative">
                        <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-brand-dark text-xs font-bold px-2 py-1 rounded-lg">
                          ${act.cost}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-bold text-sm mb-1 line-clamp-1">{act.name}</h4>
                        <p className="text-xs text-brand-gray flex-1 line-clamp-2 mb-3">{act.description}</p>
                        <button 
                          onClick={() => handleAddActivity(act.id)}
                          className="w-full py-2 bg-page-bg text-brand-deep font-semibold text-xs rounded-xl hover:bg-brand-soft transition-colors"
                        >
                          Add to Itinerary
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget Analytics Modal */}
      {isBudgetOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsBudgetOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative z-10 animate-[float_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Budget Analytics</h2>
              <button onClick={() => setIsBudgetOpen(false)} className="text-brand-gray hover:text-brand-dark font-medium">Close</button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1 bg-brand-mint/30 rounded-2xl p-6 text-center border border-brand-soft flex flex-col justify-center">
                 <p className="text-brand-gray font-medium mb-1">Total Estimated Cost</p>
                 <h3 className="text-5xl font-extrabold text-brand-deep">${totalTripCost}</h3>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Flights ($)</label>
                  <input type="number" min="0" value={flightCost} onChange={(e) => setFlightCost(Number(e.target.value))} className="w-full bg-page-bg border border-gray-200 rounded-xl py-2 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Accommodation ($)</label>
                  <input type="number" min="0" value={accommodationCost} onChange={(e) => setAccommodationCost(Number(e.target.value))} className="w-full bg-page-bg border border-gray-200 rounded-xl py-2 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Miscellaneous ($)</label>
                  <input type="number" min="0" value={miscCost} onChange={(e) => setMiscCost(Number(e.target.value))} className="w-full bg-page-bg border border-gray-200 rounded-xl py-2 px-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-fresh/50" />
                </div>
                <button onClick={handleUpdateBudget} disabled={isUpdatingBudget} className="w-full bg-brand-deep text-white py-2 rounded-xl font-medium shadow-sm hover:bg-brand-fresh transition-all">
                  {isUpdatingBudget ? 'Saving...' : 'Save Expenses'}
                </button>
              </div>
            </div>

            {budgetData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={budgetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {budgetData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(value) => `$${value}`} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-brand-gray py-8">Add activities to your trip to see budget breakdowns.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
