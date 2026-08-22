import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes/router';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ThemeToggle />
    </QueryClientProvider>
  );
}

export default App;
