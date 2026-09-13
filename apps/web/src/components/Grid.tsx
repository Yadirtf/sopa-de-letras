import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Feather, MousePointerClick } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Point {
  row: number;
  col: number;
}

interface GridProps {
  grid: string[][];
  foundCells: Set<string>;
  onWordSelected: (cells: Point[]) => void;
  disabled?: boolean;
}

export function Grid({ grid, foundCells, onWordSelected, disabled }: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [selectedCells, setSelectedCells] = useState<Point[]>([]);
  const prevSelectionLengthRef = useRef(0);
  const currentPointRef = useRef<Point | null>(null);

  const rows = grid?.length || 0;
  const cols = grid?.[0]?.length || 0;

  // Calculate straight-line cells (horizontal, vertical, diagonal)
  const calculateSelection = useCallback((start: Point, current: Point) => {
    const dr = current.row - start.row;
    const dc = current.col - start.col;
    
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);
    
    let stepR = 0;
    let stepC = 0;
    
    if (absDr > 0 && absDc === 0) {
      stepR = Math.sign(dr);
    } else if (absDc > 0 && absDr === 0) {
      stepC = Math.sign(dc);
    } else if (absDr === absDc) {
      stepR = Math.sign(dr);
      stepC = Math.sign(dc);
    } else if (absDr > absDc) {
      if (absDr > absDc * 2) {
        stepR = Math.sign(dr);
        stepC = 0;
      } else {
        stepR = Math.sign(dr);
        stepC = Math.sign(dc);
      }
    } else {
      if (absDc > absDr * 2) {
        stepR = 0;
        stepC = Math.sign(dc);
      } else {
        stepR = Math.sign(dr);
        stepC = Math.sign(dc);
      }
    }

    const maxSteps = Math.max(
      stepR !== 0 ? Math.abs(dr) : 0, 
      stepC !== 0 ? Math.abs(dc) : 0
    );

    const cells: Point[] = [];
    for (let i = 0; i <= maxSteps; i++) {
      cells.push({
        row: start.row + (stepR * i),
        col: start.col + (stepC * i)
      });
    }
    return cells;
  }, []);

  // Update selected cells array whenever points change
  useEffect(() => {
    if (startPoint && currentPoint) {
      const calculated = calculateSelection(startPoint, currentPoint);
      setSelectedCells(calculated);
      if (calculated.length !== prevSelectionLengthRef.current) {
        sounds.playInkGlide();
        prevSelectionLengthRef.current = calculated.length;
      }
    } else {
      setSelectedCells([]);
      prevSelectionLengthRef.current = 0;
    }
  }, [startPoint, currentPoint, calculateSelection]);

  // Fast O(1) Set lookup for highlighted cells
  const selectedCellsSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < selectedCells.length; i++) {
      set.add(`${selectedCells[i].row}-${selectedCells[i].col}`);
    }
    return set;
  }, [selectedCells]);

  // Current word being traced
  const currentWordSpelled = useMemo(() => {
    if (!grid || selectedCells.length === 0) return '';
    return selectedCells
      .map(pt => grid[pt.row]?.[pt.col] || '')
      .join('')
      .toUpperCase();
  }, [grid, selectedCells]);

  // Ultra-fast mathematical coordinate calculation (O(1), zero layout thrashing)
  const getPointFromCoordinates = (clientX: number, clientY: number): Point | null => {
    if (!containerRef.current || rows === 0 || cols === 0) return null;
    
    // Use cached rect or read fresh
    const rect = containerRectRef.current || containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const col = Math.floor((relX / rect.width) * cols);
    const row = Math.floor((relY / rect.height) * rows);

    const clampedCol = Math.max(0, Math.min(cols - 1, col));
    const clampedRow = Math.max(0, Math.min(rows - 1, row));

    return { row: clampedRow, col: clampedCol };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || rows === 0 || cols === 0) return;
    
    // Cache bounding box for duration of gesture to avoid reflows
    if (containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect();
    }

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const pt = getPointFromCoordinates(clientX, clientY);
    if (pt) {
      sounds.playPaperRustle();
      setIsSelecting(true);
      setStartPoint(pt);
      setCurrentPoint(pt);
      currentPointRef.current = pt;
    }
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isSelecting || disabled || rows === 0 || cols === 0) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const pt = getPointFromCoordinates(clientX, clientY);
    if (pt) {
      // ONLY trigger state re-render if the cell actually changed!
      if (pt.row !== currentPointRef.current?.row || pt.col !== currentPointRef.current?.col) {
        currentPointRef.current = pt;
        setCurrentPoint(pt);
      }
    }
  }, [isSelecting, disabled, rows, cols]);

  const handleEnd = useCallback(() => {
    if (!isSelecting || disabled) return;
    setIsSelecting(false);
    containerRectRef.current = null;
    currentPointRef.current = null;

    if (selectedCells.length > 0) {
      onWordSelected(selectedCells);
    }
    setStartPoint(null);
    setCurrentPoint(null);
    setSelectedCells([]);
  }, [isSelecting, disabled, selectedCells, onWordSelected]);

  useEffect(() => {
    if (isSelecting) {
      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isSelecting, handleMove, handleEnd]);

  if (!grid || grid.length === 0) return null;

  // Responsive board sizing: adapts seamlessly between mobile, tablet and desktop
  const boardSize = `min(100%, calc(100dvh - 160px), 540px)`;

  // SVG Vector Coordinates computation for organic ink highlighter
  const cellCenterPercent = (row: number, col: number) => {
    const x = ((col + 0.5) / cols) * 100;
    const y = ((row + 0.5) / rows) * 100;
    return { x, y };
  };

  const activeVectorLine = useMemo(() => {
    if (selectedCells.length < 2) return null;
    const first = selectedCells[0];
    const last = selectedCells[selectedCells.length - 1];
    const p1 = cellCenterPercent(first.row, first.col);
    const p2 = cellCenterPercent(last.row, last.col);
    return { x1: `${p1.x}%`, y1: `${p1.y}%`, x2: `${p2.x}%`, y2: `${p2.y}%` };
  }, [selectedCells, rows, cols]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full max-w-full select-none overflow-hidden">
      {/* Real-time word guide bar with calligraphy ribbon */}
      <div className="h-7 sm:h-8 w-full flex items-center justify-center shrink-0">
        {isSelecting && currentWordSpelled ? (
          <div className="flex items-center gap-2 px-4 py-1 bg-[#22180a]/90 border border-[#d4a359]/70 rounded-full text-amber-200 text-xs sm:text-sm font-serif font-bold shadow-lg shadow-[#b88636]/20 animate-in zoom-in-95 duration-100">
            <span className="flex items-center gap-1.5 text-[#d4a359]">
              <Feather className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider">Trazando:</span>
            </span>
            <span 
              className="text-white text-sm sm:text-base font-black tracking-widest px-1"
              style={{ fontFamily: 'Cinzel, Georgia, serif' }}
            >
              {currentWordSpelled}
            </span>
            <span className="bg-[#d4a359]/20 text-[#eed7a1] text-[10px] px-2 py-0.5 rounded-full font-sans">
              {selectedCells.length} letras
            </span>
          </div>
        ) : (
          <div className="text-[11px] sm:text-xs text-amber-200/50 flex items-center gap-1.5 font-serif italic">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-200/40 shrink-0" />
            <span>Desliza la pluma o el dedo sobre las letras para revelar palabras</span>
          </div>
        )}
      </div>

      {/* Tactile Letterpress Matrix Plate */}
      <div 
        ref={containerRef}
        className="grid-container touch-none select-none p-2 sm:p-3 bg-[#0a0f16]/95 rounded-3xl border-2 border-[#b88636]/35 shadow-2xl shadow-black/80 backdrop-blur-md shrink-0 relative overflow-hidden aspect-square"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          width: boardSize,
          height: boardSize,
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - 160px)',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gap: cols > 14 ? '2px' : '3px',
        }}
      >
        {/* Vector SVG Ink Highlighter Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="inkGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="activeInkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eed7a1" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#d4a359" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#b88636" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Active Ink Stroke connecting letters organically */}
          {activeVectorLine && (
            <>
              {/* Soft Ink Halo Wash */}
              <line
                x1={activeVectorLine.x1}
                y1={activeVectorLine.y1}
                x2={activeVectorLine.x2}
                y2={activeVectorLine.y2}
                stroke="#c59235"
                strokeWidth={cols >= 15 ? "28" : "36"}
                strokeLinecap="round"
                strokeOpacity="0.25"
                filter="url(#inkGlow)"
              />
              {/* Core Fountain Pen Ribbon */}
              <line
                x1={activeVectorLine.x1}
                y1={activeVectorLine.y1}
                x2={activeVectorLine.x2}
                y2={activeVectorLine.y2}
                stroke="url(#activeInkGrad)"
                strokeWidth={cols >= 15 ? "16" : "22"}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {/* Letterpress Individual Tiles */}
        {grid.map((row, r) => (
          row.map((letter, c) => {
            const isStart = startPoint?.row === r && startPoint?.col === c;
            const isSelected = selectedCellsSet.has(`${r}-${c}`);
            const isFound = foundCells.has(`${r}-${c}`);
            
            let classes = 'cell';
            if (isFound) classes += ' found';
            if (isSelected) classes += ' selected';
            if (isStart) classes += ' start-cell';

            return (
              <div
                key={`${r}-${c}`}
                data-row={r}
                data-col={c}
                className={classes}
                style={{
                  fontSize: cols >= 18 ? 'clamp(0.65rem, 2vw, 0.95rem)' : cols >= 15 ? 'clamp(0.75rem, 2.5vw, 1.15rem)' : 'clamp(0.95rem, 3.4vw, 1.45rem)',
                  lineHeight: '1',
                  userSelect: 'none',
                }}
              >
                {letter}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
