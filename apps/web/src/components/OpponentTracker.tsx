import { Users } from 'lucide-react';
import { ExLibrisStamp } from './ExLibrisStamp';

interface Opponent {
  id: string;
  nickname: string;
  found: number;
  total: number;
}

interface OpponentTrackerProps {
  opponents: Opponent[];
}

export function OpponentTracker({ opponents }: OpponentTrackerProps) {
  return (
    <div className="flex flex-col gap-3 bg-[#101722]/90 p-4 rounded-2xl border border-[#27384c] shadow-lg shadow-black/40">
      <h3 className="font-serif font-bold text-stone-200 border-b border-[#25364a] pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-[#d4a359]" />
          <span>Ecos de la Mesa (Rivales)</span>
        </div>
        <span className="text-[11px] text-stone-400 font-serif italic">
          {opponents?.length || 0} {(opponents?.length || 0) === 1 ? 'acompañante' : 'acompañantes'}
        </span>
      </h3>
      {(!opponents || opponents.length === 0) ? (
        <p className="text-xs text-stone-500 py-3 text-center italic font-serif">
          Aún no hay otros autores en la mesa compartida.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {opponents.map(opp => {
            const percentage = opp.total > 0 ? Math.min(100, (opp.found / opp.total) * 100) : 0;
            return (
              <div key={opp.id} className="flex flex-col gap-1.5 bg-[#0b1118]/80 p-3 rounded-xl border border-[#233345]">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <ExLibrisStamp nickname={opp.nickname} size="xs" />
                    <span className="font-serif font-bold text-[#f4eedb] truncate">{opp.nickname}</span>
                  </div>
                  <span className="font-serif font-bold text-xs text-[#eed7a1] bg-[#1a2636] border border-[#d4a359]/30 px-2 py-0.5 rounded-full">
                    {opp.found}/{opp.total}
                  </span>
                </div>
                {/* Fluid Ink Progress Level */}
                <div className="w-full bg-[#141e2b] rounded-full h-2 overflow-hidden border border-[#2d3f54] p-0.5">
                  <div 
                    className="bg-gradient-to-r from-[#b88636] via-[#d4a359] to-[#eed7a1] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(212,163,89,0.5)]" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
