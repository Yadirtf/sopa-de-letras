import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = 'inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1118] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-gradient-to-b from-[#d4a359] via-[#c59235] to-[#9e6d23] hover:from-[#e2b772] hover:to-[#b88636] text-[#080d14] font-serif font-black shadow-md shadow-[#c59235]/20 border border-[#fef08a]/40 active:translate-y-0.5',
    secondary: 'bg-[#141f2c] hover:bg-[#1c2c3e] text-[#e8ded0] border border-[#2d3f54] hover:border-[#d4a359]/50 shadow-sm hover:text-white active:translate-y-0.5 font-medium',
    danger: 'bg-gradient-to-b from-[#942729] to-[#6d1618] hover:from-[#aa3234] hover:to-[#7e1c1e] text-[#fee2e2] border border-[#ef4444]/40 font-serif font-bold shadow-md shadow-red-950/40 active:translate-y-0.5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
