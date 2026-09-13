import { Crown, Medal, Award } from 'lucide-react';
import { ExLibrisStamp } from './ExLibrisStamp';

interface LeaderboardEntry {
  nickname: string;
  elapsedMs: number;
  completedAt: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentNickname?: string;
}

export function Leaderboard({ entries, currentNickname }: LeaderboardProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const fractions = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${fractions.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#101722]/90 rounded-2xl border border-[#27384c] overflow-hidden shadow-xl shadow-black/40">
      <div className="bg-[#131d2a] p-4 border-b border-[#25364a] flex items-center justify-between">
        <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#d4a359]" />
          <span>Cuadro de Honor (Récords)</span>
        </h3>
        <span className="text-[10px] text-amber-200/60 font-serif uppercase tracking-widest">
          Mejores Tiempos
        </span>
      </div>
      
      {entries.length === 0 ? (
        <div className="p-8 text-center text-stone-400 font-serif italic text-xs">
          Aún no hay crónicas inscritas en este lienzo. ¡Sé el primero en firmar!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif">
            <thead>
              <tr className="bg-[#0b1118]/70 text-stone-400 text-xs border-b border-[#25364a]">
                <th className="p-3 w-14 text-center">Rango</th>
                <th className="p-3">Autor</th>
                <th className="p-3">Tiempo</th>
                <th className="p-3 hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const isCurrent = entry.nickname === currentNickname;
                return (
                  <tr 
                    key={idx} 
                    className={`border-b border-[#202e3f]/50 last:border-0 transition-colors ${
                      isCurrent ? 'bg-[#c59235]/10' : 'hover:bg-[#152130]/50'
                    }`}
                  >
                    <td className="p-3 text-center">
                      {idx === 0 ? (
                        <Crown className="w-4 h-4 text-[#d4a359] mx-auto" />
                      ) : idx === 1 ? (
                        <Medal className="w-4 h-4 text-stone-300 mx-auto" />
                      ) : idx === 2 ? (
                        <Medal className="w-4 h-4 text-[#b87333] mx-auto" />
                      ) : (
                        <span className="font-mono text-xs text-stone-500">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ExLibrisStamp nickname={entry.nickname} size="xs" />
                        <span className={`font-bold text-xs ${isCurrent ? 'text-[#eed7a1]' : 'text-[#e8ded0]'}`}>
                          {entry.nickname} {isCurrent && '(Tú)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-[#eed7a1]">
                      {formatTime(entry.elapsedMs)}
                    </td>
                    <td className="p-3 text-stone-500 text-[11px] hidden sm:table-cell">
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
