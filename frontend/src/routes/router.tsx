import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyTripsPage } from '@/pages/trips/MyTripsPage';
import { CreateTripPage } from '@/pages/trips/CreateTripPage';
import { ItineraryBuilderPage } from '@/pages/trips/ItineraryBuilderPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  { 
    path: '/trips', 
    element: <ProtectedRoute><MyTripsPage /></ProtectedRoute> 
  },
  { 
    path: '/trips/new', 
    element: <ProtectedRoute><CreateTripPage /></ProtectedRoute> 
  },
  { 
    path: '/trips/:id/builder', 
    element: <ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute> 
  },
  // Future routes (Phase 5, etc.):
  // { path: '/trips/:id', element: <ProtectedRoute><ItineraryViewPage /></ProtectedRoute> },
  // { path: '/trips/:id/budget', element: <ProtectedRoute><BudgetPage /></ProtectedRoute> },
  // { path: '/share/:slug', element: <PublicItineraryPage /> },
  // { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
]);
