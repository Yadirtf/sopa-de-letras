import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Edit3, 
  Save, 
  Share2, 
  Play, 
  Users, 
  Copy, 
  Check, 
  Plus, 
  X, 
  Grid3X3, 
  RefreshCw, 
  ArrowLeft, 
  Trash2, 
  Bot, 
  AlertTriangle,
  Crown,
  Globe,
  FileText,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { copyToClipboard } from '../utils/clipboard';
import { normalizeWord } from '../utils/wordNormalizer';
import { parseWordList } from '../utils/wordParser';

export function CreatePuzzle() {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  
  const [puzzleId, setPuzzleId] = useState<string | null>(urlId || null);
  const isEditing = Boolean(puzzleId);

  const [title, setTitle] = useState('');
  const [word, setWord] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [size, setSize] = useState(15);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Media' | 'Difícil'>('Media');
  const [puzzleStatus, setPuzzleStatus] = useState<'draft' | 'published'>('draft');
  const [generatedPuzzle, setGeneratedPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [parseWarning, setParseWarning] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishedCode, setPublishedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Batch / AI Import Modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [copiedAiPrompt, setCopiedAiPrompt] = useState(false);
  const [copiedWordsList, setCopiedWordsList] = useState(false);

  useEffect(() => {
    if (urlId) {
      setPuzzleId(urlId);
      loadExistingPuzzle(urlId);
    }
  }, [urlId]);

  const loadExistingPuzzle = async (targetId: string) => {
    try {
      setLoadingExisting(true);
      setError('');
      const data = await api.get(`/puzzles/edit/${targetId}`);
      setTitle(data.title || '');
      setWords(Array.isArray(data.words) ? data.words : []);
      if (data.config) {
        setSize(data.config.size || 15);
        const diffMap: Record<string, 'Fácil' | 'Media' | 'Difícil'> = {
          easy: 'Fácil',
          medium: 'Media',
          hard: 'Difícil'
        };
        setDifficulty(diffMap[data.config.difficulty] || 'Media');
      }
      setGeneratedPuzzle(data);
      setPuzzleId(data.id);
      setPuzzleStatus(data.status === 'published' ? 'published' : 'draft');
      if (data.status === 'published') {
        setPublishedCode(data.code);
      } else {
        setPublishedCode(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la sopa de letras');
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publishedCode) return;
    const url = `${window.location.origin}/play/${publishedCode}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      prompt('Copia este enlace de la sopa:', url);
    }
  };

  // Add words (handles single word or comma-separated batch)
  const handleAddWords = (rawText: string) => {
    const cleanText = rawText.trim();
    if (!cleanText) return;

    const result = parseWordList(cleanText, size, words);

    if (result.added.length > 0) {
      setWords(prev => [...prev, ...result.added]);
      setWord('');
      setParseWarning('');

      let msg = result.added.length === 1
        ? `Palabra "${result.added[0]}" agregada.`
        : `¡Se agregaron ${result.added.length} palabras con éxito!`;

      if (result.duplicates.length > 0) {
        msg += ` (${result.duplicates.length} repetidas omitidas)`;
      }
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3500);
    }

    if (result.exceeded.length > 0) {
      setParseWarning(`Palabras omitidas por exceder el tamaño de ${size}x${size}: ${result.exceeded.join(', ')}. Aumenta el tamaño si deseas incluirlas.`);
    } else if (result.added.length === 0 && result.duplicates.length > 0) {
      setParseWarning(`Las palabras ya estaban añadidas: ${result.duplicates.join(', ')}`);
    } else if (result.added.length === 0 && result.invalid.length > 0) {
      setParseWarning('Las palabras deben tener al menos 2 letras alfabéticas.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddWords(word);
  };

  const handleBatchSubmit = () => {
    if (!batchInput.trim()) return;
    handleAddWords(batchInput);
    setBatchInput('');
    setShowBatchModal(false);
  };

  const handleCopyAiPrompt = async () => {
    const promptText = `Dame una lista de 15 palabras en español relacionadas con el tema "[ESCRIBE_TU_TEMA]", separadas únicamente por comas, sin numeración ni viñetas, con palabras de entre 3 y ${size} letras. Ejemplo: palabra1, palabra2, palabra3`;
    const ok = await copyToClipboard(promptText);
    if (ok) {
      setCopiedAiPrompt(true);
      setTimeout(() => setCopiedAiPrompt(false), 2500);
    }
  };

  const handleCopyCurrentWords = async () => {
    if (words.length === 0) return;
    const ok = await copyToClipboard(words.join(', '));
    if (ok) {
      setCopiedWordsList(true);
      setTimeout(() => setCopiedWordsList(false), 2500);
    }
  };

  const handleClearAllWords = () => {
    if (words.length === 0) return;
    if (window.confirm('¿Deseas eliminar todas las palabras de la lista para empezar de nuevo?')) {
      setWords([]);
      setParseWarning('');
      setSuccessMessage('Lista de palabras vaciada.');
      setTimeout(() => setSuccessMessage(''), 2500);
    }
  };

  const removeWord = (w: string) => {
    setWords(words.filter(item => item !== w));
  };

  // Preview in Batch Modal
  const batchPreview = useMemo(() => {
    if (!batchInput.trim()) return null;
    return parseWordList(batchInput, size, words);
  }, [batchInput, size, words]);

  // Words that exceed grid size if user changes size downwards
  const wordsExceedingSize = useMemo(() => {
    return words.filter(w => normalizeWord(w).length > size);
  }, [words, size]);

  const handleSaveOrGenerate = async (targetStatus?: 'draft' | 'published') => {
    if (!title.trim() || words.length === 0) {
      setError('Añade un título y al menos una palabra');
      return;
    }

    if (wordsExceedingSize.length > 0) {
      setError(`Hay palabras que exceden el tamaño de ${size}x${size}: ${wordsExceedingSize.join(', ')}. Elimínalas o aumenta el tamaño.`);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    const diffKey = difficulty === 'Fácil' ? 'easy' : difficulty === 'Media' ? 'medium' : 'hard';
    const config = {
      size,
      difficulty: diffKey,
      allowReverse: difficulty === 'Difícil',
      allowDiagonal: difficulty !== 'Fácil',
      allowHorizontal: true,
      allowVertical: true,
    };

    const newStatus = targetStatus || puzzleStatus;

    try {
      if (puzzleId) {
        // ALWAYS UPDATE EXISTING PUZZLE - PREVENTS ANY DUPLICATION!
        await api.put(`/puzzles/${puzzleId}`, { 
          title: title.trim(), 
          words, 
          config,
          status: newStatus
        });
        const puzzleData = await api.get(`/puzzles/edit/${puzzleId}`);
        setGeneratedPuzzle(puzzleData);
        setPuzzleStatus(puzzleData.status === 'published' ? 'published' : 'draft');
        if (puzzleData.status === 'published') {
          setPublishedCode(puzzleData.code);
        } else {
          setPublishedCode(null);
        }

        if (targetStatus === 'published') {
          setSuccessMessage('¡Sopa de letras guardada y publicada con éxito!');
        } else if (targetStatus === 'draft') {
          setSuccessMessage('¡Sopa de letras guardada como borrador con éxito!');
        } else {
          setSuccessMessage('¡Sopa de letras actualizada y cuadrícula regenerada!');
        }
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        // FIRST CREATION ONLY
        const res = await api.post('/puzzles', { 
          title: title.trim(), 
          words, 
          config,
          status: newStatus
        });
        setPuzzleId(res.puzzleId);
        navigate(`/edit/${res.puzzleId}`, { replace: true });

        const puzzleData = await api.get(`/puzzles/edit/${res.puzzleId}`);
        setGeneratedPuzzle(puzzleData);
        setPuzzleStatus(puzzleData.status === 'published' ? 'published' : 'draft');
        if (puzzleData.status === 'published') {
          setPublishedCode(puzzleData.code);
        } else {
          setPublishedCode(null);
        }

        if (targetStatus === 'published') {
          setSuccessMessage('¡Sopa de letras creada y publicada con éxito!');
        } else {
          setSuccessMessage('¡Sopa de letras generada y guardada como borrador!');
        }
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la sopa de letras');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!puzzleId) {
      await handleSaveOrGenerate('published');
      return;
    }

    setPublishLoading(true);
    setError('');
    try {
      const res = await api.patch(`/puzzles/${puzzleId}/publish`);
      setPuzzleStatus('published');
      setPublishedCode(res.code || generatedPuzzle?.code);
      setSuccessMessage('¡Sopa de letras publicada! Ya está disponible para jugar y compartir.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al publicar');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!puzzleId) return;
    setPublishLoading(true);
    setError('');
    try {
      await api.patch(`/puzzles/${puzzleId}/unpublish`);
      setPuzzleStatus('draft');
      setPublishedCode(null);
      setSuccessMessage('¡Sopa de letras cambiada a borrador privado!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar a borrador');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    const pId = puzzleId || generatedPuzzle?.id;
    if (!pId) return;
    try {
      const res = await api.post('/rooms', { puzzleId: pId });
      navigate(`/room/${res.code}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear sala');
    }
  };

  if (loadingExisting) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-slate-400 font-medium">Cargando datos de la sopa de letras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090e15] text-[#ede3d2]">
      <Navbar />

      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-8">
        <Card className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-black flex items-center gap-2.5 text-white tracking-wide">
              {isEditing ? (
                <>
                  <Edit3 className="w-6 h-6 text-[#d4a359]" />
                  <span>Editar Lienzo</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-[#d4a359]" />
                  <span>Abrir Nuevo Lienzo</span>
                </>
              )}
            </h2>

            <div className="flex items-center gap-2">
              <span 
                className={`px-3 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${
                  puzzleStatus === 'published'
                    ? 'bg-[#143826] text-[#6ee7b7] border-[#2d6a4f]'
                    : 'bg-[#3d2510] text-[#fcd34d] border-[#7f4f24]'
                }`}
              >
                {puzzleStatus === 'published' ? (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publicado</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Borrador</span>
                  </>
                )}
              </span>

              <Link 
                to="/my-puzzles" 
                className="text-xs text-stone-400 hover:text-white transition-colors flex items-center gap-1 ml-1 font-serif"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Mi Archivo</span>
              </Link>
            </div>
          </div>

          {successMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{successMessage}</span>
            </div>
          )}

          {parseWarning && (
            <div className="bg-amber-950/70 border border-amber-500/60 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{parseWarning}</span>
            </div>
          )}

          {wordsExceedingSize.length > 0 && (
            <div className="bg-rose-950/70 border border-rose-500/60 text-rose-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Atención: {wordsExceedingSize.length} palabra(s) exceden el tamaño de {size}x{size}: <strong>{wordsExceedingSize.join(', ')}</strong>. Aumenta el tamaño o elimínalas.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Input 
              label="Título" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ej: Animales de la Selva, Planetas, Deportes..." 
            />
            
            {/* Word Input Form & Batch AI Button */}
            <div className="flex flex-col gap-2">
              <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input 
                    label="Añadir Palabras (individuales o separadas por comas)" 
                    value={word} 
                    onChange={e => setWord(e.target.value)} 
                    placeholder="Ej: león, tigre, elefante, cebra..." 
                  />
                </div>
                <Button type="submit" variant="secondary" className="flex items-center gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </Button>
              </form>

              {/* Quick Batch AI Helper Button */}
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-[11px] text-slate-400">
                  💡 Puedes escribir o pegar varias palabras separadas por coma <strong>,</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Pegar Lista de IA</span>
                </button>
              </div>
            </div>

            {/* Added Words List Container */}
            {words.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      Palabras agregadas ({words.length})
                    </span>
                    <span className="text-[11px] text-emerald-400/90 font-medium">
                      (Sugerido: 8-{size + 2} para {size}x{size})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCurrentWords}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copiar lista de palabras"
                    >
                      {copiedWordsList ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiadas</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleClearAllWords}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      title="Vaciar toda la lista"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Vaciar</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-xl border border-slate-700 min-h-[90px] max-h-48 overflow-y-auto content-start">
                  {words.map(w => {
                    const isTooLong = normalizeWord(w).length > size;
                    return (
                      <div 
                        key={w} 
                        className={`border px-3 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
                          isTooLong
                            ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                        title={isTooLong ? `Excede el tamaño máximo de ${size} letras` : undefined}
                      >
                        <span>{w}</span>
                        {isTooLong && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <button 
                          type="button"
                          onClick={() => removeWord(w)} 
                          className="text-red-400 hover:text-red-300 font-bold ml-1 p-0.5 rounded hover:bg-red-500/10"
                          title="Eliminar palabra"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid Size and Difficulty Config */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                  <Grid3X3 className="w-4 h-4 text-emerald-400" />
                  <span>Tamaño</span>
                </label>
                <select 
                  value={size} 
                  onChange={e => setSize(Number(e.target.value))} 
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:border-emerald-500"
                >
                  {[10, 12, 15, 18, 20].map(s => <option key={s} value={s}>{s}x{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-serif font-bold tracking-wide text-amber-200/90 uppercase flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#d4a359]" />
                  <span>Dificultad</span>
                </label>
                <select 
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value as any)} 
                  className="px-3.5 py-2.5 bg-[#0b121a] border border-[#293c52] rounded-xl text-white font-serif focus:outline-none focus:border-[#d4a359]"
                >
                  <option value="Fácil">Iniciación (Solo H/V)</option>
                  <option value="Media">Intermedio (+ Diagonal)</option>
                  <option value="Difícil">Maestría (+ Inverso)</option>
                </select>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm font-semibold bg-red-950/40 p-2.5 rounded-lg border border-red-800">{error}</div>}

            {/* Action Buttons Section */}
            <div className="flex flex-col gap-2.5 pt-2">
              {/* Primary: Generate / Regenerate */}
              <Button 
                onClick={() => handleSaveOrGenerate()} 
                isLoading={loading && !publishLoading} 
                className="w-full flex items-center justify-center gap-2 font-bold py-2.5 shadow-md"
              >
                {generatedPuzzle ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerar Distribución de Letras</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Sopa de Letras</span>
                  </>
                )}
              </Button>

              {/* Status Action Buttons (when puzzle has been generated or exists) */}
              {generatedPuzzle && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Save as draft button */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSaveOrGenerate('draft')}
                    isLoading={loading && !publishLoading}
                    className={`flex-1 text-xs font-bold flex items-center justify-center gap-1.5 ${
                      puzzleStatus === 'draft' ? 'border-amber-500/40 text-amber-300' : ''
                    }`}
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>Guardar como Borrador</span>
                  </Button>

                  {/* Publish / Unpublish Toggle button */}
                  {puzzleStatus === 'draft' ? (
                    <Button
                      type="button"
                      onClick={handlePublish}
                      isLoading={publishLoading}
                      className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Publicar Sopa</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleUnpublish}
                      isLoading={publishLoading}
                      className="flex-1 text-xs font-bold border-amber-500/50 hover:bg-amber-950/30 text-amber-300 flex items-center justify-center gap-1.5"
                      title="Volver a poner la sopa en estado borrador privado"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar a Borrador</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right Preview Card */}
        <Card className="flex-1 p-6 flex flex-col items-center bg-[#0d141e] border border-[#27384c]">
          {generatedPuzzle ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="text-center">
                <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#eed7a1]">Vista Previa del Manuscrito</span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">«{generatedPuzzle.title}»</h3>
              </div>

              {/* Tactile Visual Grid Preview */}
              <div 
                className="p-2 sm:p-3 bg-[#0a0f16] rounded-2xl border-2 border-[#b88636]/30 shadow-2xl overflow-x-auto max-w-full" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${generatedPuzzle.config.size}, minmax(0, 1fr))`, 
                  gap: '2px' 
                }}
              >
                {generatedPuzzle.grid.map((row: string[], r: number) => 
                  row.map((letter: string, c: number) => (
                    <div 
                      key={`${r}-${c}`} 
                      className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-serif font-bold text-[#e8ded0] bg-[#15202e] border border-[#2a3a4d] rounded-md text-xs sm:text-sm hover:border-[#d4a359] hover:bg-[#1c2a3d] transition-colors shadow-sm"
                    >
                      {letter}
                    </div>
                  ))
                )}
              </div>

              {publishedCode && (
                <div className="w-full mt-2 flex flex-col gap-4 bg-[#111925] p-5 rounded-2xl border border-[#26374a] shadow-xl">
                  <div className="text-center text-[#eed7a1] font-serif font-black text-base flex items-center justify-center gap-2">
                    {isEditing ? (
                      <>
                        <Check className="w-5 h-5 text-[#6ee7b7] stroke-[3]" />
                        <span>Lienzo Actualizado y Publicado</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-[#d4a359]" />
                        <span>¡Lienzo Publicado en la Galería!</span>
                      </>
                    )}
                  </div>

                  {/* Option 1: Multiplayer Salon Table */}
                  <div className="bg-[#142332] border-2 border-[#d4a359]/40 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-serif font-black uppercase tracking-wider text-[#eed7a1] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#d4a359]" />
                        <span>Para Jugar con Amigos (Mesa en Vivo)</span>
                      </span>
                      <span className="text-[10px] bg-[#c59235]/20 text-[#eed7a1] font-bold px-2 py-0.5 rounded-full border border-[#d4a359]/40 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-[#d4a359]" />
                        <span>Control de Anfitrión</span>
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 font-serif leading-relaxed">
                      Abre una <strong>Mesa de Espera</strong> con una clave poética (ej: <em>roble-tinta-luna</em>). Tú tienes el botón para iniciar la partida cuando todos los invitados hayan tomado asiento.
                    </p>
                    <Button 
                      onClick={handleCreateRoom}
                      className="w-full flex items-center justify-center gap-2 font-serif font-bold text-xs py-2.5 shadow-md"
                    >
                      <Users className="w-4 h-4" />
                      <span>Abrir Mesa de Salón e Invitar Amigos</span>
                    </Button>
                  </div>

                  {/* Option 2: Solo Play */}
                  <div className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-slate-400" />
                        <span>Modo Solitario (Práctica Individual)</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Sin sala de espera</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enlace directo para resolver la sopa individualmente a tu propio ritmo.
                    </p>
                    <div className="flex gap-2">
                      <Input readOnly value={`${window.location.origin}/play/${publishedCode}`} className="font-mono text-xs text-slate-300 bg-slate-950/80" />
                      <Button onClick={handleCopyLink} variant="secondary" size="sm" className="shrink-0 flex items-center gap-1.5 font-bold">
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                            <span className="text-emerald-400">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Enlace</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-end mt-1">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/play/${publishedCode}`)} className="text-xs flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5" />
                        <span>Jugar Yo Solo</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!publishedCode && (
                <div className="w-full mt-2 flex flex-col gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Sopa de letras en Borrador Privado</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Esta sopa está guardada de forma segura en tu cuenta en estado borrador. Solo tú puedes verla y editarla en <strong>Mis Sopas</strong> hasta que decidas publicarla.
                  </p>
                  <Button 
                    onClick={handlePublish} 
                    isLoading={publishLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 shadow-md shadow-emerald-500/20"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Publicar Sopa Ahora para Jugar y Compartir</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-8">
              <Grid3X3 className="w-12 h-12 mb-3 text-slate-600" />
              <p>Configura tu sopa a la izquierda y presiona Generar para ver la vista previa aquí.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Batch / AI Import Modal */}
      {showBatchModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowBatchModal(false)}
          title="Importar Lista de Palabras (IA o Comas)"
          maxWidth="max-w-lg"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Pega aquí directamente el texto con palabras generadas por una IA (ChatGPT, Claude, Gemini) o separadas por comas, punto y coma o saltos de línea.
            </p>

            {/* Prompt Helper Bar */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Bot className="w-4 h-4 shrink-0" />
                <span>¿Aún no tienes las palabras?</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAiPrompt}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-600 flex items-center gap-1 transition-colors"
                title="Copiar prompt modelo para pedirle a ChatGPT o Gemini"
              >
                {copiedAiPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Prompt Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prompt para IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Large Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Pega la lista de palabras:</span>
                <span className="text-[11px] text-slate-400 font-normal">Máx {size} letras por palabra</span>
              </label>
              <textarea
                rows={6}
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                placeholder="Ejemplo:&#10;león, tigre, leopardo, pantera, guepardo, jaguar, lince&#10;&#10;O también:&#10;1. Mercurio&#10;2. Venus&#10;3. Tierra&#10;4. Marte"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
                autoFocus
              />
            </div>

            {/* Live Parsing Preview */}
            {batchPreview && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>{batchPreview.added.length} palabras válidas</span>
                </div>
                {batchPreview.duplicates.length > 0 && (
                  <div className="text-amber-400 font-medium">
                    • {batchPreview.duplicates.length} repetidas
                  </div>
                )}
                {batchPreview.exceeded.length > 0 && (
                  <div className="text-rose-400 font-medium">
                    • {batchPreview.exceeded.length} exceden tamaño ({size})
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-1">
              <Button
                variant="secondary"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => setShowBatchModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
                disabled={!batchPreview || batchPreview.added.length === 0}
                onClick={handleBatchSubmit}
              >
                <Plus className="w-4 h-4" />
                <span>
                  Añadir {batchPreview?.added.length ? `(${batchPreview.added.length})` : ''} a la Sopa
                </span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <Footer />
    </div>
  );
}
