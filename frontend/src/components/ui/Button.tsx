import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary to-[#ff8c73] text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all border border-transparent',
      secondary: 'bg-gradient-to-r from-secondary to-[#38bdf8] text-white hover:shadow-lg hover:shadow-secondary/30 active:scale-[0.98] transition-all border border-transparent',
      ghost: 'bg-transparent text-textPrimary hover:bg-surface hover:shadow-sm dark:hover:bg-gray-800/50 active:scale-[0.98] transition-all border border-transparent hover:border-border',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
