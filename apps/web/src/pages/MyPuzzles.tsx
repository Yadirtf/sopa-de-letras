import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Play, 
  Swords, 
  Share2, 
  Edit3, 
  Trash2, 
  Check, 
  Grid3X3, 
  FileText, 
  AlertTriangle, 
  RefreshCw,
  FolderArchive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShareModal } from '../components/ShareModal';

export function MyPuzzles() {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [sharePuzzle, setSharePuzzle] = useState<any | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal state
  const [puzzleToDelete, setPuzzleToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Publish loading state
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // When search or status filter changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, limit]);

  useEffect(() => {
    fetchMyPuzzles(currentPage);
  }, [currentPage, debouncedSearch, statusFilter, limit]);

  const fetchMyPuzzles = async (pageToLoad: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageToLoad.toString(),
        limit: limit.toString(),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {})
      });

      const res = await api.get(`/puzzles/mine?${params.toString()}`);
      
      const items = Array.isArray(res) ? res : (res.items || []);
      const total = res?.total !== undefined ? res.total : items.length;
      const pages = res?.totalPages !== undefined ? res.totalPages : Math.ceil(total / limit) || 1;

      setPuzzles(items);
      setTotalItems(total);
      setTotalPages(pages);
    } catch (err) {
      console.error('Error fetching puzzles:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleCreateRoom = async (puzzleId: string) => {
    try {
      const res = await api.post('/rooms', { puzzleId });
      navigate(`/room/${res.code}`);
    } catch (err: any) {
      alert(err.message || 'Error al crear la sala de juego');
    }
  };

  const handlePublishDirect = async (puzzleId: string) => {
    try {
      setPublishingId(puzzleId);
      const res = await api.patch(`/puzzles/${puzzleId}/publish`);
      setPuzzles(prev => prev.map(p => p.id === puzzleId ? { ...p, status: 'published', code: res.code || p.code } : p));
      showNotification('¡Sopa de letras publicada con éxito!');
    } catch (err: any) {
      alert(err.message || 'Error al publicar la sopa');
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublishDirect = async (puzzleId: string) => {
    try {
      setPublishingId(puzzleId);
      await api.patch(`/puzzles/${puzzleId}/unpublish`);
      setPuzzles(prev => prev.map(p => p.id === puzzleId ? { ...p, status: 'draft' } : p));
      showNotification('¡Sopa de letras cambiada a borrador!');
    } catch (err: any) {
      alert(err.message || 'Error al cambiar a borrador');
    } finally {
      setPublishingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!puzzleToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      await api.delete(`/puzzles/${puzzleToDelete.id}`);
      showNotification(`"${puzzleToDelete.title}" ha sido eliminada.`);
      setPuzzleToDelete(null);
      
      // If we deleted the only item on the current page, go back 1 page if possible
      if (puzzles.length <= 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchMyPuzzles(currentPage);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'No se pudo eliminar la sopa de letras');
    } finally {
      setDeleteLoading(false);
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

  // Pagination page numbers generation
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090e15] text-[#ede3d2] select-none">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#25364a] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white flex items-center gap-2.5">
              <FolderKanban className="w-7 h-7 text-[#d4a359]" />
              <span>Mi Archivo de Manuscritos</span>
            </h1>
            <p className="text-stone-400 font-serif text-xs sm:text-sm mt-0.5">
              Custodia, edita, comparte o retira tus creaciones y lienzos personales.
            </p>
          </div>
          <Button onClick={() => navigate('/create')} className="self-start sm:self-auto shadow-md flex items-center gap-2 font-serif font-bold text-xs sm:text-sm">
            <Plus className="w-4 h-4" />
            <span>Abrir Nuevo Lienzo</span>
          </Button>
        </div>

        {/* Global Action Toast Notification */}
        {actionMessage && (
          <div className="bg-[#143826] border border-[#2d6a4f] text-[#6ee7b7] px-4 py-2.5 rounded-xl text-sm font-serif font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-[#6ee7b7] stroke-[3]" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Search, Status Tabs and Page Size Controls */}
        <div className="flex flex-col md:flex-row gap-3 bg-[#111925] p-3.5 rounded-2xl border border-[#26374a] justify-between items-center">
          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por título o clave del lienzo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-xs font-serif"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 self-start md:self-center font-serif">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#c59235] text-slate-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-[#182332]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'published'
                  ? 'bg-[#143826] text-[#6ee7b7] border border-[#2d6a4f] shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-[#182332]'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'draft'
                  ? 'bg-[#3d2510] text-[#fcd34d] border border-[#7f4f24] shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-[#182332]'
              }`}
            >
              Borradores
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs font-serif text-stone-400 self-end md:self-center">
            <span>Por página:</span>
            {[6, 12, 18].map(size => (
              <button
                key={size}
                onClick={() => setLimit(size)}
                className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition-all ${
                  limit === size
                    ? 'bg-[#c59235]/20 text-[#eed7a1] border-[#d4a359]/60 font-bold'
                    : 'bg-[#141e2b] text-stone-400 border-[#2a3c50] hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-[#111925]/60 rounded-2xl border border-[#26374a]">
            <RefreshCw className="w-9 h-9 text-[#d4a359] animate-spin" />
            <p className="font-serif italic text-sm text-[#eed7a1]">Consultando tu archivo privado...</p>
          </div>
        ) : puzzles.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center gap-4 bg-[#111925]/60 border-[#26374a]">
            <FolderArchive className="w-14 h-14 text-stone-500" />
            <div>
              <h3 className="text-lg font-serif font-bold text-white mb-1">
                {search || statusFilter !== 'all' 
                  ? 'No hay manuscritos que coincidan con los filtros' 
                  : 'Tu archivo se encuentra vacío'}
              </h3>
              <p className="text-stone-400 text-xs font-serif max-w-sm mx-auto">
                {search || statusFilter !== 'all'
                  ? 'Intenta restablecer la búsqueda o cambiar de pestaña para ver otros manuscritos.'
                  : 'Aún no has compuesto ninguna sopa de letras. Traza tu primera obra y compártela en el salón.'}
              </p>
            </div>
            {search || statusFilter !== 'all' ? (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => { setSearch(''); setStatusFilter('all'); }} 
                className="font-serif text-xs mt-2"
              >
                <span>Restablecer Filtros</span>
              </Button>
            ) : (
              <Button onClick={() => navigate('/create')} className="font-serif text-xs mt-2">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Crear mi primer lienzo</span>
              </Button>
            )}
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Grid of Puzzles for Current Page */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {puzzles.map((p) => {
                const isPublished = p.status === 'published';
                const wordsCount = Array.isArray(p.words) ? p.words.length : 0;
                const size = p.config?.size || 15;
                const isOperating = publishingId === p.id;

                return (
                  <Card key={p.id} className="p-5 flex flex-col justify-between hover:border-[#d4a359]/60 transition-all bg-[#111925]/90 group shadow-xl">
                    <div className="flex flex-col gap-3">
                      {/* Header Card: Title & Status */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold font-serif text-white group-hover:text-[#eed7a1] transition-colors truncate">
                            {p.title}
                          </h3>
                          <span className="text-[11px] font-mono text-stone-400">
                            Clave: <strong className="text-[#eed7a1]">{p.code}</strong>
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold uppercase tracking-wider shrink-0 ${
                          isPublished 
                            ? 'bg-[#143826] text-[#6ee7b7] border border-[#2d6a4f]' 
                            : 'bg-[#3d2510] text-[#fcd34d] border border-[#7f4f24]'
                        }`}>
                          {isPublished ? 'Publicada' : 'Borrador'}
                        </span>
                      </div>

                      {/* Badges / Specs */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                        {getDifficultyBadge(p.config?.difficulty)}
                        <span className="bg-[#182332] px-2 py-0.5 rounded-md border border-[#27384c] font-mono text-[11px] flex items-center gap-1">
                          <Grid3X3 className="w-3 h-3 text-stone-400" />
                          <span>{size}×{size}</span>
                        </span>
                        <span className="bg-[#182332] px-2 py-0.5 rounded-md border border-[#27384c] font-serif text-[11px] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-stone-400" />
                          <span>{wordsCount} palabras</span>
                        </span>
                      </div>

                      {/* Words Preview */}
                      <div className="text-xs text-stone-400 font-serif italic line-clamp-2">
                        {Array.isArray(p.words) && p.words.slice(0, 4).join(', ')}{wordsCount > 4 ? '...' : ''}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-[#25364a]">
                      {/* Primary Game Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-serif font-bold"
                          onClick={() => navigate(`/play/${p.code}`)}
                        >
                          <Play className="w-3.5 h-3.5 text-stone-400" />
                          <span>Jugar</span>
                        </Button>

                        <Button 
                          size="sm" 
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-serif font-bold shadow-sm"
                          onClick={() => handleCreateRoom(p.id)}
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Convocar</span>
                        </Button>
                      </div>

                      {/* Secondary Management Actions */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <button
                          onClick={() => setSharePuzzle(p)}
                          className="p-1.5 text-stone-400 hover:text-[#eed7a1] hover:bg-[#1a2533] rounded-lg transition-colors border border-transparent hover:border-[#27384c]"
                          title="Compartir o copiar enlace"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/create?edit=${p.id}`)}
                          className="p-1.5 text-stone-400 hover:text-white hover:bg-[#1a2533] rounded-lg transition-colors border border-transparent hover:border-[#27384c]"
                          title="Editar sopa de letras"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {isPublished ? (
                          <button
                            onClick={() => handleUnpublishDirect(p.id)}
                            disabled={isOperating}
                            className="px-2.5 py-1 text-[11px] font-serif rounded-lg border border-amber-900/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition-colors"
                            title="Ocultar de la galería pública"
                          >
                            {isOperating ? '...' : 'Retirar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublishDirect(p.id)}
                            disabled={isOperating}
                            className="px-2.5 py-1 text-[11px] font-serif font-bold rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                            title="Hacer visible en la galería pública"
                          >
                            {isOperating ? '...' : 'Publicar'}
                          </button>
                        )}

                        <button
                          onClick={() => { setDeleteError(''); setPuzzleToDelete(p); }}
                          className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
                          title="Eliminar sopa de letras"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Classical Atelier Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#111925] border border-[#26374a] rounded-2xl mt-4 font-serif">
                {/* Summary text */}
                <div className="text-xs text-stone-400">
                  Mostrando obras <strong className="text-white">{(currentPage - 1) * limit + 1}</strong> a{' '}
                  <strong className="text-white">{Math.min(currentPage * limit, totalItems)}</strong> de{' '}
                  <strong className="text-[#eed7a1]">{totalItems}</strong> manuscritos
                </div>

                {/* Page Controls */}
                <div className="flex items-center gap-1.5">
                  {/* First page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl border border-[#2a3c50] text-stone-300 hover:text-white hover:bg-[#182332] disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl border border-[#2a3c50] text-stone-300 hover:text-white hover:bg-[#182332] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 px-2.5 text-xs"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, idx) => {
                      if (pageNum === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-stone-500 font-mono text-xs">
                            …
                          </span>
                        );
                      }
                      const num = pageNum as number;
                      const isActive = num === currentPage;
                      return (
                        <button
                          key={num}
                          onClick={() => setCurrentPage(num)}
                          className={`w-8 h-8 rounded-xl text-xs font-mono transition-all flex items-center justify-center ${
                            isActive
                              ? 'bg-[#c59235] text-slate-950 font-black shadow-lg shadow-[#c59235]/30 scale-105'
                              : 'bg-[#141e2b] text-stone-300 hover:text-white border border-[#2a3c50] hover:bg-[#1a293b]'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-xl border border-[#2a3c50] text-stone-300 hover:text-white hover:bg-[#182332] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 px-2.5 text-xs"
                    title="Página siguiente"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-xl border border-[#2a3c50] text-stone-300 hover:text-white hover:bg-[#182332] disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {puzzleToDelete && (
        <Modal 
          isOpen={true} 
          onClose={() => !deleteLoading && setPuzzleToDelete(null)}
          title="Eliminar Sopa de Letras"
        >
          <div className="flex flex-col gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base text-slate-200 font-serif">
                ¿Estás seguro de que deseas eliminar permanentemente la sopa:
              </p>
              <p className="text-lg font-black font-serif text-rose-400 mt-1">
                "{puzzleToDelete.title}"?
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 text-left flex gap-2.5 items-start font-serif">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Atención:</strong> Esta acción no se puede deshacer. Se eliminarán la cuadrícula, las palabras y todas las salas y estadísticas asociadas.
              </span>
            </div>

            {deleteError && (
              <div className="text-xs text-red-400 font-bold bg-red-950/40 p-2 rounded border border-red-800 font-serif">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs sm:text-sm font-serif" 
                disabled={deleteLoading}
                onClick={() => setPuzzleToDelete(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger" 
                className="flex-1 text-xs sm:text-sm font-bold font-serif flex items-center justify-center gap-1.5" 
                isLoading={deleteLoading}
                onClick={confirmDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {sharePuzzle && (
        <ShareModal
          isOpen={Boolean(sharePuzzle)}
          onClose={() => setSharePuzzle(null)}
          puzzleId={sharePuzzle.id}
          puzzleCode={sharePuzzle.code}
          puzzleTitle={sharePuzzle.title}
        />
      )}

      <Footer />
    </div>
  );
}
