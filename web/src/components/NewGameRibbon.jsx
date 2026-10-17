import React from 'react';

/** Cinta de arriba que anuncia el juego nuevo y baja a la sección de juegos. */
export function NewGameRibbon() {
  return (
    <a
      className="new-game-ribbon"
      href="#juegos"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('juegos')?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <span className="new-game-ribbon__tag">¡Nuevo juego!</span>
      <span>La Batalla Más Temida ya está en WordHive, ahora en 3D. Pruébala gratis →</span>
    </a>
  );
}
