import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/client';
import { Plane, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { email, password, name };
      
      const response = await api.post(endpoint, payload);
      
      // Store token
      const token = response.data.token;
      
      // Fetch user profile immediately after
      const meResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Save to Zustand store
      setAuth(meResponse.data, token);
      
      // Navigate to protected dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Network Error: Cannot connect to backend (is localhost:3000 running?)');
      } else {
        setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg relative flex flex-col items-center justify-center font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-soft rounded-full mix-blend-multiply filter blur-[150px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-mint rounded-full mix-blend-multiply filter blur-[150px] opacity-60"></div>
      </div>

      <div className="z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-brand-fresh text-white p-3 rounded-2xl shadow-md mb-4">
            <Plane size={32} className="transform -rotate-45" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">GlobeTrotter</h1>
          <p className="text-brand-gray mt-2">Your AI travel companion.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-glass backdrop-blur-2xl border border-white/70 shadow-glass rounded-3xl p-8">
          <div className="flex space-x-6 border-b border-gray-200/50 pb-4 mb-6">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex flex-1 justify-center items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-colors ${isLogin ? 'text-brand-deep border-b-2 border-brand-fresh' : 'text-brand-muted hover:text-brand-gray'}`}
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex flex-1 justify-center items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-colors ${!isLogin ? 'text-brand-deep border-b-2 border-brand-fresh' : 'text-brand-muted hover:text-brand-gray'}`}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-1 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/80 border border-gray-200/50 rounded-2xl py-3 px-4 text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-fresh/50 transition-all shadow-sm" 
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/80 border border-gray-200/50 rounded-2xl py-3 px-4 text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-fresh/50 transition-all shadow-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-1 ml-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/80 border border-gray-200/50 rounded-2xl py-3 px-4 text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-fresh/50 transition-all shadow-sm" 
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-deep text-white font-semibold py-4 rounded-2xl shadow-md hover:bg-brand-fresh disabled:opacity-70 transition-all duration-300 mt-6"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
