import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 bg-surface shadow-soft border border-border flex items-center justify-center text-textPrimary hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </Button>
  );
};
