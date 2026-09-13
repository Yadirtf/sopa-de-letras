import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-serif font-bold tracking-wide text-amber-200/90 uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-3.5 py-2.5 bg-[#0b121a] border ${
            error 
              ? 'border-red-500/80 focus:ring-red-500/30' 
              : 'border-[#293c52] focus:border-[#d4a359] focus:ring-[#d4a359]/20'
          } rounded-xl text-[#f3eedf] placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all shadow-inner ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
