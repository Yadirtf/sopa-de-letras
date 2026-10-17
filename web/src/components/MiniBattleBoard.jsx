import React, { useMemo, useState } from 'react';

const COLS = 'ABCDEFGH';
const ROWS = 6;
const ART = '/batalla/';

/** Ejército escondido (desierto), con el arte 3D de la app: columna, fila, ancho y alto en casillas. */
const ARMY = [
  { img: 'tank', rotated: true, col: 1, row: 1, w: 3, h: 2 },
  { img: 'truck', rotated: false, col: 6, row: 0, w: 1, h: 4 },
  { img: 'soldier', rotated: true, col: 3, row: 4, w: 2, h: 1 },
];

const key = (c, r) => `${c},${r}`;
const unitAt = (c, r) => ARMY.find((u) => c >= u.col && c < u.col + u.w && r >= u.row && r < u.row + u.h);
const sprite = (u, wreck) => `${ART}${u.img}${wreck ? '_wreck' : ''}${u.rotated ? '_r' : ''}.webp`;

/**
 * Mini batalla para la landing: toca casillas hasta encontrar el ejército
 * escondido. Cada figura aparece destruida cuando cae entera, como en el juego.
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

  const [lc, lr] = last ? last.split(',').map(Number) : [];
  const message = won
    ? '¡Victoria! Encontraste todo el ejército.'
    : last
      ? `${COLS[lc]}${lr + 1}: ${unitAt(lc, lr) ? '¡Tocado! Dispara otra vez.' : 'Solo arena. Sigue buscando.'}`
      : 'Toca una casilla para disparar.';

  return (
    <div className="mini-battle" aria-label="Mini batalla de prueba en el desierto">
      <div className="mini-battle__grid" style={{ gridTemplateColumns: `20px repeat(${COLS.length}, 1fr)` }}>
        <span style={{ gridColumn: 1, gridRow: 1 }} />
        {COLS.split('').map((l, c) => (
          <span key={l} className="mini-battle__label" style={{ gridColumn: c + 2, gridRow: 1 }}>{l}</span>
        ))}
        {Array.from({ length: ROWS }, (_, r) => (
          <React.Fragment key={r}>
            <span className="mini-battle__label" style={{ gridColumn: 1, gridRow: r + 2 }}>{r + 1}</span>
            {COLS.split('').map((l, c) => {
              const shot = shots.has(key(c, r));
              const state = !shot ? '' : unitAt(c, r) ? 'hit' : 'miss';
              return (
                <button
                  key={l}
                  type="button"
                  className={`mini-battle__cell ${state ? `mini-battle__cell--${state}` : ''} ${key(c, r) === last ? 'mini-battle__cell--last' : ''}`}
                  style={{ gridColumn: c + 2, gridRow: r + 2 }}
                  aria-label={`${l}${r + 1}${state ? `, ${state === 'miss' ? 'fallo' : 'tocado'}` : ''}`}
                  onClick={() => fire(c, r)}
                />
              );
            })}
          </React.Fragment>
        ))}
        {destroyed.map((u) => (
          <img
            key={u.img}
            className="mini-battle__unit"
            src={sprite(u, true)}
            alt=""
            style={{ gridColumn: `${u.col + 2} / span ${u.w}`, gridRow: `${u.row + 2} / span ${u.h}` }}
          />
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
