import React, { useState } from 'react';
import { sound } from '../services/sound.service';
import confetti from 'canvas-confetti';

const GRID_LETTERS = [
  ['H', 'I', 'V', 'E', 'R', 'K'],
  ['B', 'A', 'S', 'O', 'P', 'A'],
  ['E', 'C', 'O', 'D', 'E', 'X'],
  ['E', 'Q', 'U', 'I', 'C', 'L'],
  ['S', 'O', 'L', 'A', 'R', 'T'],
  ['W', 'O', 'R', 'D', 'S', 'Z'],
];

const TARGET_WORDS = [
  { word: 'HIVE', coords: [[0,0], [0,1], [0,2], [0,3]] },
  { word: 'BEE', coords: [[0,0], [1,0], [2,0]] },
  { word: 'SOPA', coords: [[1,2], [1,3], [1,4], [1,5]] },
  { word: 'SOL', coords: [[4,0], [4,1], [4,2]] },
];

export function MiniWordPuzzle() {
  const [selectedCoords, setSelectedCoords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);

  const coordKey = (r, c) => `${r}-${c}`;

  const foundCoordsSet = new Set(
    foundWords.flatMap((w) => {
      const match = TARGET_WORDS.find((tw) => tw.word === w);
      return match ? match.coords.map(([r, c]) => coordKey(r, c)) : [];
    })
  );

  const handleCellClick = (r, c) => {
    sound.playClick();
    const key = coordKey(r, c);
    const existingIndex = selectedCoords.findIndex(([sr, sc]) => sr === r && sc === c);

    let nextCoords;
    if (existingIndex !== -1) {
      nextCoords = selectedCoords.filter((_, idx) => idx !== existingIndex);
    } else {
      nextCoords = [...selectedCoords, [r, c]];
    }

    setSelectedCoords(nextCoords);

    // Comprobar si las coordenadas seleccionadas forman alguna palabra objetivo
    const nextKeys = new Set(nextCoords.map(([sr, sc]) => coordKey(sr, sc)));
    for (const tw of TARGET_WORDS) {
      if (!foundWords.includes(tw.word)) {
        const matchesWord =
          tw.coords.length === nextCoords.length &&
          tw.coords.every(([tr, tc]) => nextKeys.has(coordKey(tr, tc)));

        if (matchesWord) {
          sound.playSuccess();
          const nextFound = [...foundWords, tw.word];
          setFoundWords(nextFound);
          setScore((s) => s + 100);
          setSelectedCoords([]);

          try {
            confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
          } catch {
            // Ignorar error de canvas
          }
          break;
        }
      }
    }
  };

  const handleReset = () => {
    sound.playClick();
    setSelectedCoords([]);
    setFoundWords([]);
    setScore(0);
  };

  const isAllFound = foundWords.length === TARGET_WORDS.length;

  return (
    <div className="mini-puzzle-card">
      <div className="mini-puzzle-header">
        <span>🎮 Prueba rápida en vivo</span>
        <span className="mini-puzzle-score">⭐ {score} pts</span>
      </div>

      <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {GRID_LETTERS.map((row, r) =>
          row.map((letter, c) => {
            const key = coordKey(r, c);
            const isSelected = selectedCoords.some(([sr, sc]) => sr === r && sc === c);
            const isFound = foundCoordsSet.has(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCellClick(r, c)}
                className={`mini-cell ${isSelected ? 'mini-cell--selected' : ''} ${isFound ? 'mini-cell--found' : ''}`}
                aria-label={`Letra ${letter}`}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      <div className="mini-puzzle-targets">
        <span className="mini-puzzle-targets__label">Palabras:</span>
        {TARGET_WORDS.map((tw) => (
          <span
            key={tw.word}
            className={`target-pill ${foundWords.includes(tw.word) ? 'target-pill--found' : ''}`}
          >
            {tw.word} {foundWords.includes(tw.word) ? '✓' : ''}
          </span>
        ))}
      </div>

      {isAllFound && (
        <div className="mini-puzzle-win">
          <span>🎉 ¡Completaste la sopa rápida!</span>
          <button type="button" onClick={handleReset} className="btn-link" style={{ marginLeft: 8 }}>
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}
