import { useState, useEffect } from 'react';
import { 
  Crown, 
  Target, 
  Clock, 
  Zap, 
  Medal, 
  RotateCcw, 
  Share2, 
  Check, 
  Home, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { Button } from './ui/Button';
import { copyToClipboard } from '../utils/clipboard';
import { ExLibrisStamp } from './ExLibrisStamp';
import { sounds } from '../utils/soundEffects';

export interface PlayerScore {
  id: string;
  nickname: string;
  found: number;
  total: number;
  mistakes?: number;
  accuracy?: number;
  elapsedMs?: number;
  isWinner?: boolean;
  rank?: number;
  wordsFound?: string[];
  status?: string;
}

interface VictoryModalProps {
  isOpen: boolean;
  isWinner: boolean;
  winnerNickname?: string;
  myNickname?: string;
  elapsedMs?: number;
  winnerElapsedMs?: number;
  wordsTotal: number;
  wordsFoundCount: number;
  mistakes?: number;
  accuracy?: number;
  rank?: number;
  isMultiplayer?: boolean;
  players?: PlayerScore[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function VictoryModal({
  isOpen,
  isWinner,
  winnerNickname,
  myNickname,
  elapsedMs,
  winnerElapsedMs,
  wordsTotal,
  wordsFoundCount,
  mistakes = 0,
  accuracy,
  rank,
  isMultiplayer = false,
  players = [],
  onPlayAgain,
  onGoHome,
}: VictoryModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sounds.playVictory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (ms?: number) => {
    if (!ms || ms <= 0) return '00:00.0';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  const realAccuracy = accuracy !== undefined 
    ? accuracy 
    : ((wordsFoundCount + mistakes) > 0 
        ? Math.round((wordsFoundCount / (wordsFoundCount + mistakes)) * 100) 
        : (mistakes === 0 ? 100 : 0));

  let myRank = rank;
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.isWinner && !b.isWinner) return -1;
    if (!a.isWinner && b.isWinner) return 1;
    if (b.found !== a.found) return b.found - a.found;
    if ((a.elapsedMs || 0) !== (b.elapsedMs || 0)) return (a.elapsedMs || 0) - (b.elapsedMs || 0);
    return (a.mistakes || 0) - (b.mistakes || 0);
  });

  if (!myRank && sortedPlayers.length > 0) {
    const idx = sortedPlayers.findIndex(p => p.nickname?.toLowerCase() === myNickname?.toLowerCase());
    if (idx !== -1) {
      myRank = idx + 1;
    } else if (isWinner) {
      myRank = 1;
    }
  }

  const handleShare = async () => {
    const timeStr = elapsedMs ? ` en ${formatTime(elapsedMs)}` : '';
    const rankStr = sortedPlayers.length > 1 && myRank ? ` (Puesto #${myRank} de ${sortedPlayers.length})` : '';
    const shareText = isWinner
      ? `📜 ¡He culminado el lienzo de Sopa de Letras!${rankStr} Descifré las ${wordsFoundCount}/${wordsTotal} palabras${timeStr} con ${realAccuracy}% de precisión caligráfica. ¡Ponte a prueba en ${window.location.origin}!`
      : `🕯️ He completado la sesión de Sopa de Letras.${rankStr} Descifré ${wordsFoundCount}/${wordsTotal} palabras${timeStr} con ${realAccuracy}% de precisión. ¡Descubre este atelier en ${window.location.origin}!`;

    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      prompt('Copia tu crónica para compartir:', shareText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 text-[#ede3d2]">
      <div 
        className="relative w-full max-w-lg max-h-[92dvh] flex flex-col rounded-3xl p-5 sm:p-7 text-center shadow-2xl border border-[#d4a359]/50 overflow-y-auto custom-scrollbar my-auto"
        style={{
          background: 'linear-gradient(180deg, #16202d 0%, #0d141e 100%)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)'
        }}
      >
        {/* Glow ambient circle */}
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 bg-[#d4a359]" 
        />

        {/* Header Ex Libris & Laurels */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className="mb-2">
            <ExLibrisStamp
              nickname={isWinner ? myNickname : (winnerNickname || 'Campeón')}
              size="lg"
            />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-black uppercase tracking-widest mb-2 bg-[#c59235]/15 text-[#eed7a1] border border-[#d4a359]/40 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>{isWinner ? '¡LAUREL DE VICTORIA!' : '¡SESIÓN CONCLUIDA!'}</span>
          </span>

          <h2 
            className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}
          >
            {isWinner ? (
              <>
                Honor al Maestro, <span className="text-[#eed7a1]">{myNickname || 'Autor'}</span>
              </>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Laureado: <span className="text-[#eed7a1]">{winnerNickname || 'Rival'}</span></span>
                <Crown className="w-5 h-5 text-[#d4a359] inline shrink-0" />
              </span>
            )}
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-sm mx-auto font-serif italic leading-relaxed">
            {isWinner 
              ? 'Has trazado y revelado cada una de las palabras con pulso firme y agudeza poética.' 
              : `La mesa ha concluido. ${winnerNickname || 'El anfitrión'} ha culminado el lienzo primero.`}
          </p>

          {/* Position pill in multiplayer */}
          {(isMultiplayer || sortedPlayers.length > 1) && myRank && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-serif font-bold bg-[#141d28] border border-[#27374a] text-[#eed7a1]">
              {myRank === 1 ? (
                <span className="flex items-center gap-1 text-[#eed7a1]">
                  <Crown className="w-3.5 h-3.5 text-[#d4a359]" /> 1er Lugar · Laureado de la Mesa
                </span>
              ) : myRank === 2 ? (
                <span className="flex items-center gap-1 text-stone-300">
                  <Medal className="w-3.5 h-3.5 text-stone-300" /> 2do Lugar · Ilustre Participante
                </span>
              ) : myRank === 3 ? (
                <span className="flex items-center gap-1 text-[#b87333]">
                  <Medal className="w-3.5 h-3.5 text-[#b87333]" /> 3er Lugar
                </span>
              ) : (
                <span className="text-stone-400">
                  Puesto #{myRank} de {sortedPlayers.length} autores
                </span>
              )}
            </div>
          )}
        </div>

        {/* User Stats Grid in warm study cards */}
        <div className="text-left mb-1.5 px-1">
          <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-200/70">
            Crónica de tu Desempeño
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="bg-[#0f1722] border border-[#243447] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
            <Target className="w-5 h-5 text-[#6ee7b7] mb-1" />
            <span className="text-[10px] font-serif font-bold text-stone-400 uppercase">Palabras</span>
            <span className="text-base sm:text-lg font-black text-[#6ee7b7] leading-tight font-mono">
              {wordsFoundCount}/{wordsTotal}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 font-serif">
              {Math.round((wordsFoundCount / Math.max(wordsTotal, 1)) * 100)}% descifrado
            </span>
          </div>

          <div className="bg-[#0f1722] border border-[#243447] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
            <Clock className="w-5 h-5 text-[#eed7a1] mb-1" />
            <span className="text-[10px] font-serif font-bold text-stone-400 uppercase">Tu Tiempo</span>
            <span className="text-base sm:text-lg font-black text-[#eed7a1] font-mono leading-tight">
              {formatTime(elapsedMs)}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 truncate max-w-full px-1 font-serif">
              {!isWinner && winnerElapsedMs ? `Ganador: ${formatTime(winnerElapsedMs)}` : 'Lectura'}
            </span>
          </div>

          <div className="bg-[#0f1722] border border-[#243447] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
            <Zap className="w-5 h-5 text-[#93c5fd] mb-1" />
            <span className="text-[10px] font-serif font-bold text-stone-400 uppercase">Precisión</span>
            <span className="text-base sm:text-lg font-black text-[#93c5fd] leading-tight font-mono">
              {realAccuracy}%
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 font-serif">
              Aciertos limpios
            </span>
          </div>

          <div className="bg-[#0f1722] border border-[#243447] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
            <AlertCircle className={`w-5 h-5 mb-1 ${mistakes === 0 ? 'text-[#6ee7b7]' : 'text-rose-400'}`} />
            <span className="text-[10px] font-serif font-bold text-stone-400 uppercase">Trazos Falsos</span>
            <span className={`text-base sm:text-lg font-black leading-tight font-mono ${mistakes === 0 ? 'text-[#6ee7b7]' : 'text-rose-400'}`}>
              {mistakes}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5 font-serif">
              {mistakes === 0 ? '¡Impecable!' : `${mistakes} desvíos`}
            </span>
          </div>
        </div>

        {/* Multiplayer Standings Podium */}
        {sortedPlayers.length > 0 && (
          <div className="bg-[#0d131c]/90 border border-[#233346] rounded-2xl p-3 mb-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-serif font-bold text-[#eed7a1] uppercase tracking-wider flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-[#d4a359]" />
                <span>Ecos de la Sesión ({sortedPlayers.length} participantes)</span>
              </h4>
            </div>

            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {sortedPlayers.map((p, idx) => {
                const isCurrent = p.nickname?.toLowerCase() === myNickname?.toLowerCase();
                const pRank = p.rank || idx + 1;

                return (
                  <div
                    key={p.id || idx}
                    className={`flex flex-col gap-1 px-3 py-2 rounded-xl text-xs border transition-all ${
                      pRank === 1
                        ? 'bg-[#c59235]/15 border-[#d4a359]/40 text-[#eed7a1]'
                        : isCurrent
                        ? 'bg-[#1b4332]/20 border-[#2d6a4f]/50 text-[#d1fae5]'
                        : 'bg-[#101722] border-[#223040] text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 flex items-center justify-center font-serif font-bold shrink-0">
                          {pRank === 1 ? (
                            <Crown className="w-4 h-4 text-[#d4a359]" />
                          ) : pRank === 2 ? (
                            <Medal className="w-4 h-4 text-stone-300" />
                          ) : (
                            <span className="font-mono text-xs text-stone-500">#{pRank}</span>
                          )}
                        </span>
                        <ExLibrisStamp nickname={p.nickname} size="xs" />
                        <span className={`truncate font-serif max-w-[130px] sm:max-w-[170px] ${isCurrent ? 'font-black text-white' : 'font-medium text-stone-200'}`}>
                          {p.nickname} {isCurrent && '(Tú)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-xs bg-[#0b1017] px-2 py-0.5 rounded-md border border-[#233346] text-[#6ee7b7]">
                          {p.found}/{p.total} pal.
                        </span>
                        {p.elapsedMs !== undefined && p.elapsedMs > 0 && (
                          <span className="font-mono text-[11px] text-[#eed7a1] bg-[#0b1017] px-1.5 py-0.5 rounded border border-[#233346] hidden sm:inline">
                            {formatTime(p.elapsedMs)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button 
            variant="secondary" 
            onClick={handleShare} 
            className="flex-1 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#6ee7b7] stroke-[3]" />
                <span>¡Crónica Copiada!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#d4a359]" />
                <span>Compartir Victoria</span>
              </>
            )}
          </Button>
          <Button 
            onClick={onPlayAgain} 
            className="flex-1 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-1.5 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isWinner ? 'Nuevo Lienzo' : 'Revancha en la Mesa'}</span>
          </Button>
        </div>

        <div className="mt-3">
          <button
            onClick={onGoHome}
            className="text-xs text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline flex items-center justify-center gap-1.5 mx-auto font-serif"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Regresar a la Galería Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
