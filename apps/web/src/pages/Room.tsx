import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Target, 
  Check, 
  Copy, 
  Play, 
  LogIn, 
  RefreshCw,
  AlertCircle,
  Crown,
  Hourglass,
  Feather,
  Sparkles
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Grid } from '../components/Grid';
import { WordList } from '../components/WordList';
import { Timer } from '../components/Timer';
import { OpponentTracker } from '../components/OpponentTracker';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { copyToClipboard } from '../utils/clipboard';
import { VictoryModal } from '../components/VictoryModal';
import { ExLibrisStamp } from '../components/ExLibrisStamp';
import { normalizeWord } from '../utils/wordNormalizer';
import { sounds } from '../utils/soundEffects';

export function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const { isConnected, players, roomStatus, gameStartedData, winnerData, setWinnerData, roomError, emit } = useSocket(code);
  const game = useGame();
  
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [guestNickname, setGuestNickname] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [roomCopied, setRoomCopied] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleCopyRoom = async () => {
    const invitationMessage = `🕯️ *Invitación a la Mesa Literaria*\n\nHe convocado una sesión en la mesa «${code}» para descifrar juntos «${roomData?.puzzle?.title || 'este lienzo'}».\n\nÚnete a la mesa de espera aquí:\n${window.location.href}\n\nArrancaremos en cuanto estemos todos reunidos.`;
    const ok = await copyToClipboard(invitationMessage);
    if (ok) {
      setRoomCopied(true);
      setTimeout(() => setRoomCopied(false), 2500);
    } else {
      prompt('Copia este mensaje de invitación:', invitationMessage);
    }
  };

  const opponents = useMemo(() => {
    return players.filter(p => p.id !== user?.id && (user?.nickname ? p.nickname !== user?.nickname : true));
  }, [players, user?.id, user?.nickname]);

  useEffect(() => {
    fetchRoom();
  }, [code]);

  useEffect(() => {
    if (gameStartedData) {
      const puzzle = gameStartedData.puzzle;
      const sessionId = (user?.id && gameStartedData.sessions?.[user.id]) || 
                        (user?.nickname && gameStartedData.sessions?.[user.nickname]) || 
                        roomData?.id || 'session';
      if (puzzle && puzzle.grid) {
        try {
          const grid = typeof puzzle.grid === 'string' ? JSON.parse(puzzle.grid) : puzzle.grid;
          const words = typeof puzzle.words === 'string' ? JSON.parse(puzzle.words) : puzzle.words;
          const initialWords = Array.isArray(gameStartedData.wordsFound) ? gameStartedData.wordsFound : [];
          game.initGame(puzzle.id, sessionId, grid, words, true, initialWords);
          sounds.playPaperRustle();
          if (initialWords.length === 0) {
            setCountdown(3);
          } else {
            setCountdown(null);
          }
        } catch (e) {
          console.error('Error parsing puzzle grid/words:', e);
        }
      }
    } else if (roomStatus === 'playing' && roomData?.puzzle?.grid && game.grid.length === 0) {
      try {
        const p = roomData.puzzle;
        const grid = typeof p.grid === 'string' ? JSON.parse(p.grid) : p.grid;
        const words = typeof p.words === 'string' ? JSON.parse(p.words) : p.words;
        const sessionId = (user?.id && roomData?.sessions?.[user.id]) || roomData.id || 'session';
        game.initGame(p.id, sessionId, grid, words, true);
      } catch (e) {
        console.error('Error initializing game from roomData:', e);
      }
    }
  }, [gameStartedData, roomStatus, roomData, user, game.grid.length]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        sounds.playInkGlide();
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/rooms/${code}`);
      setRoomData(res);
      if (res?.status === 'finished') {
        try {
          const summary = await api.get(`/rooms/${code}/summary`);
          if (summary) {
            setWinnerData(summary);
          }
        } catch (e) {
          console.error('Error fetching room summary', e);
        }
      }
    } catch (err) {
      setError('Mesa no encontrada');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomStatus === 'finished' && (!winnerData?.standings || winnerData.standings.length === 0)) {
      api.get(`/rooms/${code}/summary`)
        .then(summary => {
          if (summary?.standings) {
            setWinnerData((prev: any) => ({ ...prev, ...summary }));
          }
        })
        .catch(console.error);
    }
  }, [roomStatus, code, winnerData?.standings]);

  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNickname.trim()) return;
    setGuestLoading(true);
    setGuestError('');
    try {
      const res = await api.post('/auth/guest', { nickname: guestNickname.trim() });
      setUser(res.user, res.token);
    } catch (err: any) {
      setGuestError(err.message || 'Error al unirse');
    } finally {
      setGuestLoading(false);
    }
  };

  const startGame = () => {
    emit('start_game', { roomCode: code, code, hostId: user?.id });
  };

  const handleWordFound = (cells: {row: number, col: number}[]) => {
    sounds.playWordFound();
    const word = cells.map(pt => game.grid[pt.row]?.[pt.col] || '').join('');
    emit('word_found', { 
      sessionId: game.sessionId, 
      roomId: code, 
      roomCode: code, 
      code, 
      cells, 
      word,
      userId: user?.id,
      nickname: user?.nickname 
    });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#090e15] text-[#ede3d2]">
      <RefreshCw className="w-9 h-9 text-[#d4a359] animate-spin" />
      <p className="font-serif italic text-sm text-[#eed7a1]">Abriendo las puertas del salón...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center bg-[#090e15] text-[#ede3d2]">
      <AlertCircle className="w-12 h-12 text-rose-400" />
      <p className="text-rose-300 text-lg font-serif">{error}</p>
      <Button onClick={() => navigate('/')} className="flex items-center gap-2 font-serif">
        <ArrowLeft className="w-4 h-4" />
        <span>Regresar a la Galería</span>
      </Button>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#090e15] text-[#ede3d2]">
        <Card className="w-full max-w-md p-8 flex flex-col gap-6 text-center border-[#d4a359]/40 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#c59235]/15 border border-[#d4a359]/40 flex items-center justify-center mx-auto text-[#eed7a1] shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black mb-1 text-white tracking-wide">
              ¡Has sido invitado a la Mesa!
            </h1>
            <p className="text-[#eed7a1] font-serif font-bold text-sm tracking-wider">
              Mesa poética: «{code}»
            </p>
            {roomData?.puzzle?.title && (
              <p className="text-stone-300 text-sm mt-2 font-serif">
                Lienzo: <span className="text-white font-bold">«{roomData.puzzle.title}»</span>
              </p>
            )}
          </div>
          <p className="text-stone-400 text-xs font-serif leading-relaxed">
            Ingresa tu nombre o monograma de autor para unirte a la mesa de espera:
          </p>
          <form onSubmit={handleGuestJoin} className="flex flex-col gap-4">
            <Input
              placeholder="Ej: Gabriel, Sor Juana, Dante..."
              value={guestNickname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestNickname(e.target.value)}
              required
              minLength={2}
              autoFocus
            />
            {guestError && <span className="text-xs text-rose-400 font-serif">{guestError}</span>}
            <Button type="submit" isLoading={guestLoading} size="lg" className="w-full flex items-center justify-center gap-2 font-serif font-bold">
              <LogIn className="w-4 h-4" />
              <span>Tomar Asiento en la Mesa</span>
            </Button>
          </form>
          <div className="text-xs text-stone-400 font-serif">
            ¿Tienes cuenta de autor?{' '}
            <button 
              onClick={() => navigate('/login', { state: { returnTo: `/room/${code}` } })} 
              className="text-[#eed7a1] hover:underline"
            >
              Inicia sesión aquí
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const isHost = roomData?.hostId === user?.id;

  if (roomStatus === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#090e15] text-[#ede3d2]">
        <Card className="w-full max-w-lg p-8 flex flex-col gap-6 border-[#d4a359]/40 shadow-2xl">
          <div className="text-center border-b border-[#25364a] pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold text-[#eed7a1] bg-[#c59235]/15 border border-[#d4a359]/40 uppercase tracking-widest mb-3">
              <Feather className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Mesa de Salón Literario</span>
            </div>

            <h1 
              className="text-2xl sm:text-3xl font-black text-white tracking-wide"
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
            >
              «{code}»
            </h1>

            <p className="text-xs text-stone-400 font-serif italic mt-1">
              Esperando a los invitados convocados...
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-bold text-stone-200 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#d4a359]" />
                <span>Autores en la Mesa ({players.length})</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-sans ${
                isConnected ? 'bg-[#143826] text-[#6ee7b7] border border-[#2d6a4f]' : 'bg-[#3d2510] text-[#fcd34d] border border-[#7f4f24]'
              }`}>
                {isConnected ? '● En línea' : '○ Conectando...'}
              </span>
            </h3>

            <ul className="bg-[#0b1118]/80 rounded-2xl p-4 border border-[#233346] flex flex-col gap-2.5">
              {players.map(p => (
                <li key={p.id} className="flex items-center gap-3">
                  <ExLibrisStamp nickname={p.nickname} size="xs" />
                  <span className={`font-serif text-sm ${p.nickname === user?.nickname ? 'font-bold text-[#eed7a1]' : 'text-stone-300'}`}>
                    {p.nickname} {p.nickname === user?.nickname && '(Tú)'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button variant="secondary" onClick={handleCopyRoom} className="flex items-center justify-center gap-2 font-serif text-xs font-bold">
            {roomCopied ? (
              <>
                <Check className="w-4 h-4 text-[#6ee7b7] stroke-[3]" />
                <span>¡Carta de invitación copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#d4a359]" />
                <span>Copiar Carta de Invitación para Amigos</span>
              </>
            )}
          </Button>

          {isHost ? (
            <div className="flex flex-col gap-3 mt-1">
              <div className="bg-[#1a2533] border border-[#d4a359]/40 rounded-2xl p-3.5 text-xs text-[#eed7a1] font-serif flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Eres el Anfitrión:</strong> Posees la llave de la mesa. Cuando tus invitados hayan tomado asiento, pulsa <strong>«Iniciar Sesión para Todos»</strong>.
                </span>
              </div>
              <Button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-serif font-black shadow-lg" size="lg">
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Sesión para Todos</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-1 bg-[#0b1118]/80 border border-[#233346] rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-[#eed7a1] font-serif font-bold text-sm">
                <Hourglass className="w-4 h-4 animate-spin text-[#d4a359]" />
                <span>Aguardando a que el anfitrión abra el lienzo</span>
              </div>
              <p className="text-xs text-stone-400 font-serif leading-relaxed">
                El anfitrión (<strong className="text-white">{roomData?.host?.nickname || 'el convocante'}</strong>) dará la señal de inicio en cualquier momento.
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="h-dvh max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#090e15] text-[#ede3d2] select-none">
      {/* Countdown overlay when host starts the match */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-50 bg-[#090e15]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#c59235]/20 border border-[#d4a359]/40 flex items-center justify-center text-[#eed7a1] mb-4 shadow-lg animate-bounce">
            <Feather className="w-8 h-8" />
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2"
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}
          >
            ¡El lienzo se abre ante ustedes!
          </h2>
          <p className="text-stone-300 font-serif italic text-sm mb-8">
            Comienza la búsqueda de las palabras en el manuscrito...
          </p>
          <div className="w-28 h-28 rounded-full bg-[#141d28] border-4 border-[#d4a359] flex items-center justify-center shadow-[0_0_60px_rgba(212,163,89,0.3)]">
            <span className="text-6xl font-black font-serif text-[#eed7a1] animate-pulse">{countdown}</span>
          </div>
        </div>
      )}

      {/* 1. Atelier Header */}
      <header className="shrink-0 bg-[#0c121b]/95 border-b border-[#25364a] px-3 sm:px-6 py-2 flex items-center justify-between gap-2 shadow-sm z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#141f2d] transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-serif font-black truncate text-white">
              {roomData?.puzzle?.title}
            </h1>
            <div className="text-[10px] sm:text-xs text-stone-400 font-serif flex items-center gap-1.5">
              <span>Mesa: <strong className="font-mono text-[#eed7a1]">{code}</strong></span>
              <span>•</span>
              <span className="text-amber-200/70 font-semibold">{players.length} autores</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Timer & Progress Counter */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#142332] border border-[#d4a359]/40 px-2.5 sm:px-3 py-1 rounded-full text-xs font-serif font-bold text-[#eed7a1]">
            <Target className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>{game.foundWords.length}/{game.words.length}</span>
          </div>

          <div className="bg-[#121924] border border-[#25364a] px-2.5 py-1 rounded-full font-mono text-xs">
            <Timer startTime={game.startTime || Date.now()} isRunning={roomStatus === 'playing'} />
          </div>

          <button
            onClick={() => setShowDetailsModal(true)}
            className="md:hidden p-1.5 bg-[#141f2d] hover:bg-[#1a293b] text-stone-300 hover:text-white rounded-xl border border-[#25364a] text-xs font-serif flex items-center gap-1.5"
            title="Ver palabras y rivales"
          >
            <Users className="w-4 h-4 text-[#d4a359]" />
            <span className="hidden sm:inline">Mesa</span>
          </button>
        </div>
      </header>

      {/* 2. Ambient Multiplayer Duel Ticker with Ex Libris Seals & Ink Flow (Mobile Only) */}
      <div className="shrink-0 bg-[#0c131c] border-b border-[#25364a] px-3 sm:px-6 py-2 shadow-md md:hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-serif font-bold">
            {/* Player 1 (You) */}
            <div className="flex items-center gap-2 min-w-0">
              <ExLibrisStamp nickname={user?.nickname} size="xs" />
              <span className="text-[#eed7a1] font-black truncate max-w-[120px] sm:max-w-[200px]">
                {user?.nickname || 'Tú'} (Tú)
              </span>
              <span className="bg-[#142332] text-[#eed7a1] border border-[#d4a359]/40 px-2 py-0.5 rounded-md font-mono text-[11px] shrink-0 font-bold">
                {game.foundWords.length}/{game.words.length}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-serif font-bold text-amber-200/70 shrink-0 px-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
              <span className="hidden sm:inline">Sesión en Vivo</span>
            </div>

            {/* Opponent 1 */}
            {opponents.length > 0 ? (
              <div className="flex items-center gap-2 min-w-0 justify-end">
                <span className="bg-[#1a2636] text-stone-200 border border-[#2d3f54] px-2 py-0.5 rounded-md font-mono text-[11px] shrink-0 font-bold">
                  {opponents[0].found}/{opponents[0].total || game.words.length}
                </span>
                <span className="text-stone-300 font-bold truncate max-w-[120px] sm:max-w-[200px]">
                  {opponents[0].nickname}
                </span>
                <ExLibrisStamp nickname={opponents[0].nickname} size="xs" />
              </div>
            ) : (
              <div className="text-[11px] text-stone-500 font-serif italic shrink-0">
                Aguardando autor...
              </div>
            )}
          </div>

          {/* Dual Fountain Pen Fluid Ink Bars */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="w-full bg-[#121a24] rounded-full h-2.5 overflow-hidden border border-[#2b3c4f] p-0.5 shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#b88636] via-[#d4a359] to-[#eed7a1] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(212,163,89,0.5)]"
                style={{ width: `${game.words.length > 0 ? Math.min(100, (game.foundWords.length / game.words.length) * 100) : 0}%` }}
              />
            </div>

            <div className="w-full bg-[#121a24] rounded-full h-2.5 overflow-hidden border border-[#2b3c4f] p-0.5 shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#6ee7b7] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(110,231,183,0.4)]"
                style={{ 
                  width: `${opponents.length > 0 && (opponents[0].total || game.words.length) > 0 
                    ? Math.min(100, (opponents[0].found / (opponents[0].total || game.words.length)) * 100) 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Words Ticker Bar for Mobile */}
      <div className="shrink-0 bg-[#090e15]/80 border-b border-[#223042] px-3 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar md:hidden">
        <span className="text-[10px] font-serif font-bold text-stone-400 uppercase tracking-wider shrink-0">Descifrar:</span>
        <div className="flex items-center gap-1.5">
          {game.words.map(w => {
            const isFound = game.foundWords.some(fw => normalizeWord(fw) === normalizeWord(w));
            return (
              <span
                key={w}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-serif uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                  isFound
                    ? 'bg-[#143826]/80 text-[#6ee7b7] line-through border border-[#2d6a4f]/60 opacity-60'
                    : 'bg-[#121924] text-stone-200 border border-[#25364a]'
                }`}
              >
                {isFound && <Check className="w-3 h-3 text-[#6ee7b7] stroke-[3]" />}
                <span>{w}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Room Error Banner if any */}
      {roomError && (
        <div className="shrink-0 bg-rose-950/90 border-b border-rose-500/60 text-rose-200 text-xs px-4 py-2 text-center font-serif flex items-center justify-center gap-2 z-20">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{roomError}</span>
        </div>
      )}

      {/* 4. Main Game Arena */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center p-2 sm:p-4 md:p-6 gap-4 lg:gap-6 overflow-hidden">
        <div className="flex-1 flex items-center justify-center w-full h-full min-h-0 overflow-hidden">
          {game.grid && game.grid.length > 0 ? (
            <Grid 
              grid={game.grid} 
              foundCells={game.foundCells} 
              onWordSelected={(cells) => {
                game.handleWordSelected(cells);
                handleWordFound(cells);
              }} 
              disabled={roomStatus !== 'playing' || (countdown !== null && countdown > 0)} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8 bg-[#101824]/90 rounded-3xl border border-[#25364a] shadow-xl max-w-md mx-auto">
              <RefreshCw className="w-10 h-10 text-[#d4a359] animate-spin" />
              <div>
                <h3 className="text-lg font-serif font-bold text-white mb-1">
                  Disponiendo el Manuscrito
                </h3>
                <p className="text-xs text-stone-400 font-serif leading-relaxed">
                  Extendiendo las tintas y preparando la cuadrícula del salón...
                </p>
              </div>
              {roomData?.puzzle && (
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const p = roomData.puzzle;
                    const grid = typeof p.grid === 'string' ? JSON.parse(p.grid) : p.grid;
                    const words = typeof p.words === 'string' ? JSON.parse(p.words) : p.words;
                    const sessionId = (user?.id && roomData?.sessions?.[user.id]) || roomData.id || 'session';
                    game.initGame(p.id, sessionId, grid, words, true);
                  }}
                  className="text-xs font-serif mt-2"
                >
                  <span>Abrir Cuadrícula del Salón</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Desktop & Tablet Right Sidebar: Words to find + Opponents below */}
        <aside className="hidden md:flex flex-col gap-4 w-72 lg:w-80 h-full overflow-y-auto custom-scrollbar pr-1 shrink-0">
          <WordList words={game.words} foundWords={game.foundWords} />
          <OpponentTracker opponents={opponents} />
        </aside>
      </main>

      {/* 5. Game Finished Epic Victory Screen */}
      {(() => {
        const standingsList = (winnerData?.standings && Array.isArray(winnerData.standings) && winnerData.standings.length > 0)
          ? winnerData.standings
          : players;

        const mySummary = Array.isArray(standingsList)
          ? standingsList.find((p: any) => 
              (user?.id && p.id === user.id) || 
              (user?.nickname && p.nickname?.toLowerCase() === user.nickname.toLowerCase())
            )
          : null;

        const isUserWinner = Boolean(
          (user?.id && winnerData?.winnerId === user.id) || 
          (user?.nickname && winnerData?.nickname?.toLowerCase() === user.nickname.toLowerCase()) ||
          (mySummary?.isWinner)
        );

        const myFound = mySummary?.found ?? game.foundWords.length;
        const myTotal = mySummary?.total || game.words.length;
        const myMistakes = mySummary?.mistakes ?? 0;
        const myAccuracy = mySummary?.accuracy;
        const winnerElapsed = winnerData?.elapsedMs ? Number(winnerData.elapsedMs) : undefined;
        const myElapsed = mySummary?.elapsedMs 
          ? Number(mySummary.elapsedMs) 
          : (isUserWinner && winnerElapsed 
              ? winnerElapsed 
              : (game.endTime ? game.endTime - game.startTime : (game.startTime > 0 ? Date.now() - game.startTime : undefined)));
        const myRank = mySummary?.rank;

        return (
          <VictoryModal
            isOpen={roomStatus === 'finished'}
            isWinner={isUserWinner}
            winnerNickname={winnerData?.nickname}
            myNickname={user?.nickname}
            elapsedMs={myElapsed}
            winnerElapsedMs={winnerElapsed}
            wordsTotal={myTotal}
            wordsFoundCount={myFound}
            mistakes={myMistakes}
            accuracy={myAccuracy}
            rank={myRank}
            isMultiplayer={true}
            players={standingsList}
            onPlayAgain={isHost ? startGame : () => window.location.reload()}
            onGoHome={() => navigate('/')}
          />
        );
      })()}

      {/* 6. Mobile Details Modal */}
      {showDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowDetailsModal(false)} title="Palabras & Ecos de la Mesa">
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <WordList words={game.words} foundWords={game.foundWords} />
            <OpponentTracker opponents={opponents} />
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)} className="font-serif">
              Cerrar y volver a la mesa
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
