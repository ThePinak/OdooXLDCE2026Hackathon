import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { User, Map, Plane, DollarSign, LogOut, ChevronLeft } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalTrips: 0, countriesVisited: 0, totalBudget: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/me/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-page-bg"><p className="text-brand-gray animate-pulse">Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-page-bg font-sans text-brand-dark pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-fresh/20 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-[float_10s_ease-in-out_infinite]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-mint/30 rounded-full blur-[120px] mix-blend-multiply opacity-60 animate-[float_15s_ease-in-out_infinite_reverse]"></div>
      </div>

      <nav className="relative z-10 bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow-sm text-brand-gray hover:text-brand-deep transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-extrabold tracking-tight text-brand-deep">Profile</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-500 hover:text-red-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm">
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-glass backdrop-blur-xl border border-white/70 shadow-glass rounded-3xl p-8 flex flex-col md:flex-row items-center md:space-x-8 text-center md:text-left">
          <div className="w-24 h-24 bg-brand-deep text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md mb-4 md:mb-0 shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-1">{user?.name}</h2>
            <p className="text-brand-gray text-lg">{user?.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
            <div className="p-3 bg-brand-mint/50 rounded-2xl text-brand-deep">
              <Plane size={24} />
            </div>
            <div>
              <p className="text-brand-gray text-sm font-medium mb-1">Total Trips</p>
              <h3 className="text-3xl font-extrabold text-brand-dark">{stats.totalTrips}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
            <div className="p-3 bg-brand-fresh/20 rounded-2xl text-brand-fresh">
              <Map size={24} />
            </div>
            <div>
              <p className="text-brand-gray text-sm font-medium mb-1">Countries Visited</p>
              <h3 className="text-3xl font-extrabold text-brand-dark">{stats.countriesVisited}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-brand-gray text-sm font-medium mb-1">Total Travel Budget</p>
              <h3 className="text-3xl font-extrabold text-brand-dark">${stats.totalBudget.toLocaleString()}</h3>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
