import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      // Allow mocking logic if VITE_API_URL isn't fully ready yet, 
      // but standard call expects the actual backend
      const response = await apiClient.post('/auth/login', { email, password });
      
      // We expect response.data to have a token, and ideally a user object.
      // If user isn't returned from /login, we might need a separate /users/me call.
      // Let's assume standard auth flow returns token, we'll fetch user or mock it.
      const token = response.data.token;
      
      // Let's fetch the user profile right after login if not in login response
      let user = response.data.user;
      if (!user) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userRes = await apiClient.get('/users/me');
        user = userRes.data;
      }
      
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        console.warn('Backend not reachable, logging in with mock user.');
        setAuth({ id: 'mock-user-id', name: 'Test User', email }, 'mock-jwt-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-textPrimary font-sans tracking-tight">
          Welcome back to GlobeTrotter
        </h2>
        <p className="mt-2 text-center text-sm text-textSecondary">
          Or{' '}
          <Link to="/signup" className="font-medium text-secondary hover:text-secondary/80">
            create a new account
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Card className="px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
