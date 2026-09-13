import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Feather, 
  PenTool, 
  Users, 
  RefreshCw, 
  FileText, 
  BookOpen, 
  Play, 
  Share2,
  Compass, 
  Scroll,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Crown,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShareModal } from '../components/ShareModal';
import { ExLibrisStamp } from '../components/ExLibrisStamp';

interface PuzzleItem {
  id: string;
  code: string;
  title: string;
  words: string[];
  config: {
    size: number;
    difficulty: string;
  };
  createdAt: string;
  creator?: {
    nickname: string;
  };
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  
  // Gallery states with Pinterest-style infinite scroll
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [creatingRoomForId, setCreatingRoomForId] = useState<string | null>(null);
  const [sharePuzzle, setSharePuzzle] = useState<PuzzleItem | null>(null);

  // Search & Difficulty Filters for Gallery
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search input to avoid spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When filters change, reset and load first batch
  useEffect(() => {
    setPage(1);
    setPuzzles([]);
    setHasMore(true);
    fetchPuzzlesBatch(1, true);
  }, [debouncedSearch, selectedDifficulty]);

  const fetchPuzzlesBatch = async (pageNum: number, isNewFilter = false) => {
    try {
      if (isNewFilter) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '6',
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(selectedDifficulty !== 'all' ? { difficulty: selectedDifficulty } : {})
      });

      const res = await api.get(`/puzzles?${params.toString()}`);
      
      const newItems: PuzzleItem[] = Array.isArray(res) ? res : (res.items || []);
      const total = res?.total !== undefined ? res.total : newItems.length;
      const moreAvailable = res?.hasMore !== undefined ? res.hasMore : newItems.length >= 6;

      setTotalCount(total);
      setHasMore(moreAvailable);

      setPuzzles(prev => {
        if (isNewFilter || pageNum === 1) return newItems;
        // Avoid duplicate items by id
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newItems.filter(p => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setPage(pageNum);
    } catch (err) {
      console.error('Error al cargar manuscritos:', err);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingInitial && !loadingMore && hasMore) {
      fetchPuzzlesBatch(page + 1, false);
    }
  }, [loadingInitial, loadingMore, hasMore, page, debouncedSearch, selectedDifficulty]);

  // IntersectionObserver for Pinterest-like automatic progressive scroll loading
  useEffect(() => {
    const el = observerTarget.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingInitial) {
        handleLoadMore();
      }
    }, { 
      rootMargin: '300px 0px' // Load ahead before the user reaches the very bottom
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, loadingMore, loadingInitial]);

  /**
   * Cleans input to extract code even if user pastes a URL or wrapped quote
   */
  const extractCode = (input: string): string => {
    let clean = input.trim();
    clean = clean.replace(/^["'«»\s]+|["'«»\s]+$/g, '');
    
    if (clean.includes('/room/')) {
      const parts = clean.split('/room/');
      clean = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
    } else if (clean.includes('/play/')) {
      const parts = clean.split('/play/');
      clean = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
    } else if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const parts = clean.split('/');
      clean = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
    }
    return clean;
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCode = extractCode(code);
    if (!rawCode) return;

    setJoinLoading(true);
    setJoinError('');

    try {
      try {
        const roomRes = await api.get(`/rooms/${encodeURIComponent(rawCode)}`);
        if (roomRes?.code) {
          navigate(`/room/${roomRes.code}`);
          return;
        }
      } catch {}

      if (rawCode !== rawCode.toLowerCase()) {
        try {
          const roomRes = await api.get(`/rooms/${encodeURIComponent(rawCode.toLowerCase())}`);
          if (roomRes?.code) {
            navigate(`/room/${roomRes.code}`);
            return;
          }
        } catch {}
      }

      try {
        const puzzleRes = await api.get(`/puzzles/${encodeURIComponent(rawCode)}`);
        if (puzzleRes?.code || puzzleRes?.id) {
          navigate(`/play/${puzzleRes.code || rawCode}`);
          return;
        }
      } catch {}

      if (rawCode !== rawCode.toLowerCase()) {
        try {
          const puzzleRes = await api.get(`/puzzles/${encodeURIComponent(rawCode.toLowerCase())}`);
          if (puzzleRes?.code || puzzleRes?.id) {
            navigate(`/play/${puzzleRes.code || rawCode.toLowerCase()}`);
            return;
          }
        } catch {}
      }

      setJoinError('No se halló ninguna mesa o lienzo activo con esa clave poética.');
    } catch (err: any) {
      setJoinError('Error al conectar con la mesa. Verifica el código e inténtalo de nuevo.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreateDuel = async (puzzle: PuzzleItem) => {
    if (!user) {
      setSharePuzzle(puzzle);
      return;
    }
    try {
      setCreatingRoomForId(puzzle.id);
      const res = await api.post('/rooms', { puzzleId: puzzle.id });
      navigate(`/room/${res.code}`);
    } catch (err: any) {
      alert(err.message || 'Error al convocar la mesa');
    } finally {
      setCreatingRoomForId(null);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
      case 'fácil':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold bg-[#143826]/80 text-[#6ee7b7] border border-[#2d6a4f]/80">
            Iniciación
          </span>
        );
      case 'medium':
      case 'media':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold bg-[#3d2510]/80 text-[#fcd34d] border border-[#7f4f24]/80">
            Intermedio
          </span>
        );
      case 'hard':
      case 'difícil':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold bg-[#421417]/80 text-[#fca5a5] border border-[#991b1b]/80">
            Maestría
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090e15] text-[#ede3d2] relative">
      {/* Background Floating Poetic Words (skills.md atelier aesthetic) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-20">
        <span className="absolute top-[10%] left-[6%] text-3xl font-serif text-[#d4a359] italic animate-float-gentle">
          tinta
        </span>
        <span className="absolute top-[24%] right-[10%] text-4xl font-serif text-[#6ee7b7] italic animate-float-gentle" style={{ animationDelay: '3s' }}>
          claroscuro
        </span>
        <span className="absolute top-[45%] left-[12%] text-2xl font-serif text-[#93c5fd] italic animate-float-gentle" style={{ animationDelay: '5s' }}>
          verso
        </span>
        <span className="absolute top-[65%] right-[16%] text-3xl font-serif text-[#eed7a1] italic animate-float-gentle" style={{ animationDelay: '2s' }}>
          monograma
        </span>
        <span className="absolute top-[82%] left-[20%] text-2xl font-serif text-[#d4a359] italic animate-float-gentle" style={{ animationDelay: '4s' }}>
          silencio
        </span>
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col gap-14 z-10">

        {/* 1. Atelier Hero Header */}
        <section className="text-center pt-2 sm:pt-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a359]/30 bg-[#c59235]/10 text-[#eed7a1] text-xs font-serif font-bold tracking-widest uppercase mb-5 shadow-sm">
            <Feather className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Atelier de Rompecabezas & Letras • Salón Literario</span>
          </div>

          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl"
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}
          >
            El Arte Silencioso de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eed7a1] via-[#d4a359] to-[#c59235]">Descifrar Palabras</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-300/80 max-w-2xl mx-auto mt-4 font-serif leading-relaxed">
            Resuelve lienzos literarios en la serenidad de tu estudio o convoca a tus amistades a una mesa compartida en tiempo real con monogramas heráldicos y trazo caligráfico.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Button 
              size="lg"
              onClick={() => {
                const el = document.getElementById('galeria-manuscritos');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 font-serif font-bold text-sm shadow-xl"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Manuscritos</span>
            </Button>

            <Button 
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('seccion-unirse');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 font-serif font-bold text-sm border-[#d4a359]/40 text-[#eed7a1]"
            >
              <Compass className="w-4 h-4 text-[#d4a359]" />
              <span>Unirse a una Mesa</span>
            </Button>

            <Button 
              variant="secondary"
              size="lg"
              onClick={() => navigate(user && !user.isGuest ? '/create' : '/login', { state: { returnTo: '/create' } })}
              className="flex items-center gap-2 font-serif text-sm text-stone-300"
            >
              <PenTool className="w-4 h-4 text-stone-400" />
              <span>Abrir Nuevo Lienzo</span>
            </Button>
          </div>
        </section>

        {/* 2. Dual Showcase: Quick Join Console & The Atelier Ritual */}
        <section id="seccion-unirse" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card A: Unirse a una Sesión por Clave */}
          <Card className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-[#d4a359]/40 bg-[#0f1722]/95 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c59235]/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#c59235]/15 border border-[#d4a359]/40 flex items-center justify-center text-[#eed7a1] shadow-inner shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif font-black text-xl text-white">
                    Mesa de Espera Rápida
                  </h2>
                  <p className="text-xs text-[#eed7a1]/80 font-serif">
                    Ingresa con la clave poética o el enlace de tu anfitrión
                  </p>
                </div>
              </div>

              <p className="text-stone-300/80 text-xs font-serif leading-relaxed mb-5">
                Si un amigo ha convocado una sesión o te envió una carta de invitación, escribe aquí su clave poética o pega directamente el enlace del salón.
              </p>

              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <div className="relative">
                  <Input 
                    placeholder="Ej: roble-tinta-luna o enlace del salón" 
                    value={code} 
                    onChange={e => {
                      setCode(e.target.value);
                      if (joinError) setJoinError('');
                    }} 
                    className="font-serif text-xs tracking-wider pr-10"
                    autoComplete="off"
                  />
                  {code && (
                    <button 
                      type="button" 
                      onClick={() => setCode('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs font-mono"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Button 
                  type="submit" 
                  isLoading={joinLoading} 
                  className="w-full flex items-center justify-center gap-2 py-3 font-serif font-bold text-sm shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Tomar Asiento en la Mesa</span>
                </Button>

                {joinError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-serif text-center">
                    {joinError}
                  </div>
                )}
              </form>
            </div>

            <div className="pt-4 mt-5 border-t border-[#223347] flex items-center justify-between text-[11px] font-serif text-stone-400">
              <span className="italic">¿Ejemplo de clave?</span>
              <span className="font-mono text-[#eed7a1] bg-[#142332] px-2 py-0.5 rounded border border-[#2a3c50]">
                roble-tinta-luna
              </span>
            </div>
          </Card>

          {/* Card B: El Ritual del Atelier (3 pasos) */}
          <Card id="ritual-atelier" className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-[#25364a] bg-[#0c131d]/90 shadow-2xl">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[#eed7a1]">
                <Sparkles className="w-5 h-5 text-[#d4a359]" />
                <h3 className="font-serif font-bold text-lg text-white">
                  El Ritual del Salón Literario
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#142332] border border-[#d4a359]/40 flex items-center justify-center font-serif font-black text-xs text-[#eed7a1] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-100">
                      Elige o Traza un Lienzo
                    </h4>
                    <p className="text-xs text-stone-400 font-serif leading-relaxed mt-0.5">
                      Explora la galería inferior o compone tu propio vocabulario temático con dimensiones personalizadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#142332] border border-[#d4a359]/40 flex items-center justify-center font-serif font-black text-xs text-[#eed7a1] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-100 flex items-center gap-2">
                      <span>Sella tu Monograma Ex Libris</span>
                    </h4>
                    <p className="text-xs text-stone-400 font-serif leading-relaxed mt-0.5">
                      Elige tu timbre heráldico y la tinta de autor que te distinguirá ante tus contrincantes en el tablero.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#142332] border border-[#d4a359]/40 flex items-center justify-center font-serif font-black text-xs text-[#eed7a1] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-100">
                      Descifra en Calma o en Duelo Sincrónico
                    </h4>
                    <p className="text-xs text-stone-400 font-serif leading-relaxed mt-0.5">
                      Observa el fluir de tinta de los demás autores en tiempo real o disfruta la resolución contemplativa sin prisa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-[#223347] flex items-center justify-between text-xs font-serif text-stone-400">
              <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tableros garantizados sin solapamientos fallidos</span>
              </span>
            </div>
          </Card>
        </section>

        {/* 3. Features & Mechanics: Pilares de Atelier */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0f1722]/80 border border-[#233346] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142332] border border-[#d4a359]/30 flex items-center justify-center text-[#eed7a1]">
              <Crown className="w-5 h-5 text-[#d4a359]" />
            </div>
            <h4 className="font-serif font-bold text-base text-white">
              Control de Anfitrión
            </h4>
            <p className="text-xs text-stone-400 font-serif leading-relaxed">
              El creador de la sala posee la llave: los invitados toman asiento y la partida arranca simultáneamente para todos con cuenta regresiva.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f1722]/80 border border-[#233346] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142332] border border-[#6ee7b7]/30 flex items-center justify-center text-[#6ee7b7]">
              <Flame className="w-5 h-5 text-[#6ee7b7]" />
            </div>
            <h4 className="font-serif font-bold text-base text-white">
              Duelo en Vivo & Marcador Táctil
            </h4>
            <p className="text-xs text-stone-400 font-serif leading-relaxed">
              Barras de fluidez de tinta y timbres Ex Libris reflejan el avance de cada oponente en tiempo real conforme descubren palabras.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0f1722]/80 border border-[#233346] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142332] border border-[#93c5fd]/30 flex items-center justify-center text-[#93c5fd]">
              <ShieldCheck className="w-5 h-5 text-[#93c5fd]" />
            </div>
            <h4 className="font-serif font-bold text-base text-white">
              Lienzos de Autor Verificados
            </h4>
            <p className="text-xs text-stone-400 font-serif leading-relaxed">
              Generador con normalización de acentos, trazos multidireccionales orgánicos y sin callejones sin salida.
            </p>
          </div>
        </section>

        {/* 4. Galería de Manuscritos con Carga Progresiva Tipo Pinterest */}
        <section id="galeria-manuscritos" className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#25364a] pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5 font-serif">
                <BookOpen className="w-6 h-6 text-[#d4a359]" />
                <span>Galería de Manuscritos</span>
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm font-serif mt-0.5">
                {totalCount > 0 ? `${totalCount} obras disponibles en el archivo literario` : 'Lienzos disponibles para estudio o duelo:'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => {
                  setPage(1);
                  setPuzzles([]);
                  fetchPuzzlesBatch(1, true);
                }} 
                isLoading={loadingInitial}
                className="flex items-center gap-1.5 font-serif text-xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </Button>

              <Button 
                size="sm" 
                onClick={() => navigate(user && !user.isGuest ? '/create' : '/login', { state: { returnTo: '/create' } })}
                className="flex items-center gap-1.5 font-serif text-xs shrink-0"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Crear Obra</span>
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d141e] p-3 rounded-2xl border border-[#233346]">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, palabra o autor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121a24] text-xs font-serif text-white rounded-xl pl-9 pr-3 py-2 border border-[#2a3c50] focus:border-[#d4a359] outline-none placeholder:text-stone-500"
              />
            </div>

            {/* Difficulty Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-serif text-stone-400 mr-1 hidden sm:inline">Dificultad:</span>
              <button
                onClick={() => setSelectedDifficulty('all')}
                className={`px-3 py-1 rounded-xl text-xs font-serif transition-all ${
                  selectedDifficulty === 'all'
                    ? 'bg-[#c59235]/20 text-[#eed7a1] border border-[#d4a359]/40 font-bold'
                    : 'bg-[#121a24] text-stone-400 hover:text-white border border-[#25364a]'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedDifficulty('easy')}
                className={`px-3 py-1 rounded-xl text-xs font-serif transition-all ${
                  selectedDifficulty === 'easy'
                    ? 'bg-[#143826] text-[#6ee7b7] border border-[#2d6a4f] font-bold'
                    : 'bg-[#121a24] text-stone-400 hover:text-white border border-[#25364a]'
                }`}
              >
                Iniciación
              </button>
              <button
                onClick={() => setSelectedDifficulty('medium')}
                className={`px-3 py-1 rounded-xl text-xs font-serif transition-all ${
                  selectedDifficulty === 'medium'
                    ? 'bg-[#3d2510] text-[#fcd34d] border border-[#7f4f24] font-bold'
                    : 'bg-[#121a24] text-stone-400 hover:text-white border border-[#25364a]'
                }`}
              >
                Intermedio
              </button>
              <button
                onClick={() => setSelectedDifficulty('hard')}
                className={`px-3 py-1 rounded-xl text-xs font-serif transition-all ${
                  selectedDifficulty === 'hard'
                    ? 'bg-[#421417] text-[#fca5a5] border border-[#991b1b] font-bold'
                    : 'bg-[#121a24] text-stone-400 hover:text-white border border-[#25364a]'
                }`}
              >
                Maestría
              </button>
            </div>
          </div>

          {/* Initial Loading Skeleton */}
          {loadingInitial ? (
            <div className="p-16 text-center text-stone-400 bg-[#121a24]/60 rounded-3xl border border-[#25364a] flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#d4a359] animate-spin" />
              <span className="font-serif italic text-sm">Disponiendo los manuscritos iniciales sobre la mesa...</span>
            </div>
          ) : puzzles.length === 0 ? (
            <div className="p-16 text-center text-stone-400 bg-[#121a24]/60 rounded-3xl border border-[#25364a] flex flex-col items-center gap-3">
              <Scroll className="w-12 h-12 text-stone-500" />
              <p className="text-base font-serif font-bold text-white">
                {searchQuery ? 'No hay manuscritos que coincidan con la búsqueda.' : 'Aún no hay manuscritos expuestos en la galería.'}
              </p>
              {searchQuery ? (
                <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')} className="font-serif text-xs">
                  <span>Limpiar búsqueda</span>
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate(user && !user.isGuest ? '/create' : '/login')}
                  className="flex items-center gap-2 mt-2 font-serif"
                >
                  <Feather className="w-4 h-4" />
                  <span>Sé el primero en abrir un lienzo</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Pinterest-like Masonry / Multi-column Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {puzzles.map((p, index) => (
                  <Card 
                    key={`${p.id}-${index}`} 
                    className="p-5 flex flex-col justify-between hover:border-[#d4a359]/60 transition-all shadow-xl bg-[#111924]/90 group animate-in fade-in duration-300"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg sm:text-xl font-bold font-serif text-white group-hover:text-[#eed7a1] transition-colors leading-snug">
                          {p.title}
                        </h3>
                        {getDifficultyBadge(p.config?.difficulty)}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-stone-400">
                        <span className="bg-[#182332] px-2.5 py-1 rounded-lg border border-[#27384c] flex items-center gap-1 font-mono text-[11px]">
                          <span>{p.config?.size || 10}×{p.config?.size || 10}</span>
                        </span>
                        <span className="bg-[#182332] px-2.5 py-1 rounded-lg border border-[#27384c] flex items-center gap-1 font-serif">
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          <span>{p.words?.length || 0} palabras</span>
                        </span>
                        {p.creator?.nickname && (
                          <div className="bg-[#182332] px-2.5 py-0.5 rounded-lg border border-[#27384c] flex items-center gap-1.5">
                            <ExLibrisStamp nickname={p.creator.nickname} size="xs" />
                            <span className="font-serif text-xs text-amber-200/90">{p.creator.nickname}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-stone-400/80 font-serif italic line-clamp-2">
                        Vocabulario: {p.words?.slice(0, 5).join(', ')}{p.words?.length > 5 ? '...' : ''}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-[#25364a]">
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary"
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-serif font-bold" 
                          size="sm"
                          onClick={() => navigate(`/play/${p.code}`)}
                        >
                          <Play className="w-3.5 h-3.5 text-stone-400" />
                          <span>Estudio Solo</span>
                        </Button>
                        <Button 
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-serif font-bold shadow-sm" 
                          size="sm"
                          isLoading={creatingRoomForId === p.id}
                          onClick={() => handleCreateDuel(p)}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Convocar Mesa</span>
                        </Button>
                      </div>
                      <button
                        onClick={() => setSharePuzzle(p)}
                        className="text-xs text-stone-400 hover:text-[#eed7a1] transition-colors flex items-center justify-center gap-1.5 py-1.5 font-serif bg-[#0a0f16]/60 hover:bg-[#182434] rounded-lg border border-[#25364a]"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Generar Carta de Invitación</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Progressive Scroll Loading Sentinel & Feedback */}
              <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center">
                {loadingMore && (
                  <div className="flex flex-col items-center justify-center gap-2 py-4 text-stone-400 font-serif animate-pulse">
                    <RefreshCw className="w-6 h-6 text-[#d4a359] animate-spin" />
                    <span className="text-xs italic text-[#eed7a1]">
                      Desplegando más manuscritos sobre la mesa...
                    </span>
                  </div>
                )}

                {/* Manual Load More Button if desired */}
                {!loadingMore && hasMore && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleLoadMore} 
                    className="font-serif text-xs flex items-center gap-1.5 text-stone-300 hover:text-[#eed7a1] border-[#27384c]"
                  >
                    <span>Cargar más obras al desplazar</span>
                    <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                  </Button>
                )}

                {!hasMore && puzzles.length > 0 && (
                  <div className="py-6 text-center text-xs font-serif text-stone-400 border-t border-[#1e2c3d]/70 w-full max-w-md flex flex-col items-center gap-1.5">
                    <Feather className="w-4 h-4 text-[#d4a359]" />
                    <span>Has recorrido todos los manuscritos del salón ({puzzles.length} obras exploradas)</span>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Literary Footer */}
      <Footer />

      {sharePuzzle && (
        <ShareModal
          isOpen={Boolean(sharePuzzle)}
          onClose={() => setSharePuzzle(null)}
          puzzleId={sharePuzzle.id}
          puzzleCode={sharePuzzle.code}
          puzzleTitle={sharePuzzle.title}
        />
      )}
    </div>
  );
}
