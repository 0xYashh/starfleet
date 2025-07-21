'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface CartoonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

const commonRetroStyles = [
  'text-black border-2 border-black rounded-lg',
  // after pseudo-element for shadow
  "after:content-[''] after:block after:absolute after:w-full after:bg-black after:rounded-lg after:-z-10 after:top-[-2px] after:left-0",
  "after:transition-transform after:duration-200 after:ease-out",
  "hover:after:translate-x-0 hover:after:translate-y-0",
].join(' ');

const variantStyles: Record<string, string> = {
  default: `bg-gray-200 active:bg-gray-300 ${commonRetroStyles}`,
  primary: `bg-[#fee6e3] active:bg-[#ffdeda] ${commonRetroStyles}`,
  secondary: `bg-[#e3e6fe] active:bg-[#dadcff] ${commonRetroStyles}`,
  danger: `bg-red-300 active:bg-red-400 ${commonRetroStyles}`,
};

const sizeStyles: Record<string, string> = {
  lg: 'h-12 px-[25px] md:px-10 text-base after:h-12 after:translate-x-2 after:translate-y-2',
  md: 'h-10 px-6 text-sm after:h-10 after:translate-x-1.5 after:translate-y-1.5',
  sm: 'h-9 px-4 text-sm after:h-9 after:translate-x-1 after:translate-y-1',
};


export const CartoonButton = forwardRef<HTMLButtonElement, CartoonButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'lg',
    isLoading = false,
    children,
    disabled,
    loadingText,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles from the provided CSS
          'relative box-border flex items-center justify-center',
          'font-semibold leading-6 text-center no-underline',
          // Apply Poppins font to all buttons
          '[font-family:var(--font-poppins)]',
          'cursor-pointer select-none outline-0',
          // Remove the opacity reduction for disabled state
          'disabled:cursor-not-allowed',
          
          // Variant and Size styles
          variantStyles[variant],
          sizeStyles[size],
          
          className
        )}
        {...props}
      >
        <span className={cn(
          'flex items-center justify-center gap-2 whitespace-nowrap',
          isLoading && !loadingText && 'opacity-0'
        )}>
          {isLoading && loadingText ? loadingText : children}
        </span>
        
        {isLoading && !loadingText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
          </div>
        )}
      </button>
    );
  }
); 

CartoonButton.displayName = 'CartoonButton'; 