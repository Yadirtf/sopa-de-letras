import React, { useMemo, useState } from 'react';

const COLS = 'ABCDEFGH';
const ROWS = 6;

/** Ejército escondido del mini tablero (desierto): columna, fila, ancho, alto. */
const ARMY = [
  { emoji: '🛡️', name: 'Tanque', col: 1, row: 1, w: 2, h: 2 },
  { emoji: '🚚', name: 'Camión', col: 5, row: 0, w: 1, h: 3 },
  { emoji: '🪖', name: 'Soldado', col: 4, row: 4, w: 2, h: 1 },
];

const key = (c, r) => `${c},${r}`;

function unitAt(c, r) {
  return ARMY.find((u) => c >= u.col && c < u.col + u.w && r >= u.row && r < u.row + u.h);
}

/**
 * Mini batalla para la landing: toca casillas hasta encontrar el ejército
 * escondido. Las figuras se dibujan cuando caen enteras, como en el juego.
 */
export function MiniBattleBoard() {
  const [shots, setShots] = useState(() => new Set());
  const [last, setLast] = useState(null);

  const destroyed = useMemo(
    () => ARMY.filter((u) => {
      for (let c = u.col; c < u.col + u.w; c++) {
        for (let r = u.row; r < u.row + u.h; r++) if (!shots.has(key(c, r))) return false;
      }
      return true;
    }),
    [shots],
  );
  const won = destroyed.length === ARMY.length;

  const fire = (c, r) => {
    if (won || shots.has(key(c, r))) return;
    setShots(new Set(shots).add(key(c, r)));
    setLast(key(c, r));
  };

  const reset = () => {
    setShots(new Set());
    setLast(null);
  };

  const lastUnit = last && unitAt(...last.split(',').map(Number));
  const message = won
    ? '¡Victoria! Encontraste todo el ejército.'
    : last
      ? `${COLS[last.split(',')[0]]}${Number(last.split(',')[1]) + 1}: ${lastUnit ? '¡Tocado! 💥' : 'Agua… digo, arena 🏜️'}`
      : 'Toca una casilla para disparar.';

  return (
    <div className="mini-battle" aria-label="Mini batalla de prueba en el desierto">
      <div className="mini-battle__grid" style={{ gridTemplateColumns: `20px repeat(${COLS.length}, 1fr)` }}>
        <span />
        {COLS.split('').map((l) => (
          <span key={l} className="mini-battle__label">{l}</span>
        ))}
        {Array.from({ length: ROWS }, (_, r) => (
          <React.Fragment key={r}>
            <span className="mini-battle__label">{r + 1}</span>
            {COLS.split('').map((l, c) => {
              const shot = shots.has(key(c, r));
              const unit = unitAt(c, r);
              const fallen = unit && destroyed.includes(unit);
              const isCorner = fallen && unit.col === c && unit.row === r;
              const state = !shot ? '' : unit ? (fallen ? 'fallen' : 'hit') : 'miss';
              return (
                <button
                  key={l}
                  type="button"
                  className={`mini-battle__cell ${state ? `mini-battle__cell--${state}` : ''} ${key(c, r) === last ? 'mini-battle__cell--last' : ''}`}
                  aria-label={`${l}${r + 1}${state ? `, ${state === 'miss' ? 'fallo' : 'tocado'}` : ''}`}
                  onClick={() => fire(c, r)}
                >
                  {isCorner ? unit.emoji : shot && !fallen ? (unit ? '💥' : '•') : ''}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <p className="mini-battle__status" role="status">{message}</p>
      <div className="mini-battle__footer">
        <span>
          Caídos: {destroyed.length}/{ARMY.length} · Disparos: {shots.size}
        </span>
        {shots.size > 0 && (
          <button type="button" className="btn-link" onClick={reset}>
            Otra vez
          </button>
        )}
      </div>
    </div>
  );
}
