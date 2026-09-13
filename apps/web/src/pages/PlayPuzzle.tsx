import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  BookOpen, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../hooks/useAuth';
import { Grid } from '../components/Grid';
import { WordList } from '../components/WordList';
import { Timer } from '../components/Timer';
import { Leaderboard } from '../components/Leaderboard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { VictoryModal } from '../components/VictoryModal';
import { ShareModal } from '../components/ShareModal';
import { normalizeWord } from '../utils/wordNormalizer';
import { sounds } from '../utils/soundEffects';

export function PlayPuzzle() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const game = useGame();
  
  const [puzzleTitle, setPuzzleTitle] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestNickname, setGuestNickname] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  // Mobile drawer/modal for WordList and Leaderboard
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowGuestModal(true);
      setLoading(false);
      return;
    }
    setShowGuestModal(false);
    loadGame();
  }, [user, code]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const puzzleRes = await api.get(`/puzzles/${code}`);
      const puzzleData = puzzleRes.puzzle || puzzleRes;
      const sessionRes = await api.post('/game/sessions', { puzzleId: puzzleData.id });
      const sessionId = sessionRes.session?.id || sessionRes.id;
      
      setPuzzleTitle(puzzleData.title);
      game.initGame(puzzleData.id, sessionId, puzzleData.grid, puzzleData.words);
      
      const lbRes = await api.get(`/puzzles/${code}/leaderboard`);
      setLeaderboard(Array.isArray(lbRes) ? lbRes : (lbRes.leaderboard || []));
    } catch (err: any) {
      setError('No se pudo disponer el lienzo solicitado.');
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelected = (cells: { row: number; col: number }[]) => {
    const prevCount = game.foundWords.length;
    game.handleWordSelected(cells);
    // If a new word was found, trigger harmonious chime
    setTimeout(() => {
      if (game.foundWords.length > prevCount) {
        sounds.playWordFound();
      }
    }, 50);
  };

  const handleGuestSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestNickname.trim()) return;
    setGuestLoading(true);
    try {
      const res = await api.post('/auth/guest', { nickname: guestNickname.trim() });
      setUser(res.user, res.token);
      setShowGuestModal(false);
    } catch (e) {
      setGuestLoading(false);
    }
  };

  if (showGuestModal) {
    return (
      <Modal isOpen={true} title="Identificación de Autor">
        <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
          <p className="text-stone-300 font-serif text-sm leading-relaxed">
            Ingresa un apodo o monograma para firmar tus descubrimientos en este lienzo:
          </p>
          <Input 
            placeholder="Ej: Rosalía, Horacio, Virginia..." 
            value={guestNickname} 
            onChange={e => setGuestNickname(e.target.value)} 
            required
            minLength={2}
            autoFocus
          />
          <Button type="submit" isLoading={guestLoading} className="font-serif">
            Comenzar Estudio
          </Button>
          <div className="text-center mt-2">
            <button 
              type="button"
              onClick={() => navigate('/login', { state: { returnTo: `/play/${code}` } })} 
              className="text-xs text-[#eed7a1] font-serif hover:underline"
            >
              O accede con tu cuenta registrada
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-[#090e15] text-stone-300">
        <RefreshCw className="w-9 h-9 text-[#d4a359] animate-spin" />
        <p className="font-serif italic text-sm text-[#eed7a1]">Desplegando el manuscrito sobre el atril...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center bg-[#090e15]">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-rose-300 text-lg font-serif">{error}</p>
        <Button onClick={() => navigate('/')} className="flex items-center gap-2 font-serif">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Galería</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-dvh max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#090e15] text-[#ede3d2] select-none">
      {/* 1. Atelier Header */}
      <header className="shrink-0 bg-[#0c121b]/95 border-b border-[#25364a] px-3 sm:px-6 py-2 flex items-center justify-between gap-2 shadow-md z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#141f2d] transition-colors border border-transparent hover:border-[#27384c]"
            title="Volver a la Galería"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-serif font-black truncate text-white tracking-wide">
              {puzzleTitle}
            </h1>
            <div className="text-[10px] sm:text-xs text-stone-400 font-serif flex items-center gap-1.5">
              <span>Lienzo: <strong className="font-mono text-[#eed7a1]">{code}</strong></span>
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
            <Timer startTime={game.startTime} isRunning={!game.isComplete} endTime={game.endTime} />
          </div>

          {/* Invitation / Duel button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-[#c59235]/15 hover:bg-[#c59235]/25 border border-[#d4a359]/40 text-[#eed7a1] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Invitar a amigos a resolver juntos"
          >
            <Users className="w-3.5 h-3.5 text-[#d4a359]" />
            <span className="hidden sm:inline">Invitar a la Mesa</span>
          </button>

          {/* Button on mobile to view full list / leaderboard */}
          <button
            onClick={() => setShowDetailsModal(true)}
            className="md:hidden p-1.5 bg-[#141f2d] hover:bg-[#1a293b] text-stone-300 hover:text-white rounded-xl border border-[#25364a] text-xs font-serif flex items-center gap-1.5"
            title="Ver repertorio de palabras"
          >
            <BookOpen className="w-4 h-4 text-[#d4a359]" />
            <span className="hidden sm:inline">Palabras</span>
          </button>
        </div>
      </header>

      {/* 2. Marginalia Word Ticker Bar (for Mobile) */}
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

      {/* 3. Main Study Arena with Generous Spatial Clarity */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center p-2 sm:p-4 md:p-6 gap-4 lg:gap-6 overflow-hidden">
        {/* The Grid Arena - Centered and calm */}
        <div className="flex-1 flex items-center justify-center w-full h-full min-h-0 overflow-hidden">
          <Grid 
            grid={game.grid} 
            foundCells={game.foundCells} 
            onWordSelected={handleWordSelected} 
            disabled={game.isComplete} 
          />
        </div>

        {/* Desktop & Tablet Marginalia Sidebar */}
        <aside className="hidden md:flex flex-col gap-4 w-72 lg:w-80 h-full overflow-y-auto custom-scrollbar pr-1 shrink-0">
          <WordList words={game.words} foundWords={game.foundWords} />
          <Leaderboard entries={leaderboard} currentNickname={user?.nickname} />
        </aside>
      </main>

      {/* 4. Victory / Completed Celebration Modal */}
      <VictoryModal
        isOpen={game.isComplete}
        isWinner={true}
        myNickname={user?.nickname}
        elapsedMs={game.endTime ? (game.endTime - game.startTime) : (Date.now() - game.startTime)}
        wordsTotal={game.words.length}
        wordsFoundCount={game.foundWords.length}
        onPlayAgain={() => window.location.reload()}
        onGoHome={() => navigate('/')}
      />

      {/* 5. Mobile Details Modal */}
      {showDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowDetailsModal(false)} title="Palabras & Cuadro de Honor">
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <WordList words={game.words} foundWords={game.foundWords} />
            <Leaderboard entries={leaderboard} currentNickname={user?.nickname} />
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)} className="font-serif">
              Cerrar y proseguir
            </Button>
          </div>
        </Modal>
      )}

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          puzzleId={game.puzzleId || ''}
          puzzleCode={code || ''}
          puzzleTitle={puzzleTitle}
        />
      )}
    </div>
  );
}
