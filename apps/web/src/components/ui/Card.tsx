import { ReactNode } from 'react';

export function Card({ 
  children, 
  className = '', 
  id,
  ...props 
}: { 
  children: ReactNode; 
  className?: string; 
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id={id} {...props} className={`bg-gradient-to-b from-[#131b26]/90 to-[#0e1620]/95 border border-[#27384c] rounded-2xl shadow-xl shadow-black/40 overflow-hidden backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}
