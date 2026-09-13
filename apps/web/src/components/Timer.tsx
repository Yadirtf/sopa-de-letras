import { useEffect, useState } from 'react';

interface TimerProps {
  startTime: number;
  isRunning: boolean;
  endTime?: number;
}

export function Timer({ startTime, isRunning, endTime }: TimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const elapsed = (endTime || now) - startTime;
  
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  return (
    <div className="font-mono text-xl font-bold text-slate-200 bg-slate-800 px-4 py-2 rounded-lg inline-flex shadow-inner">
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
