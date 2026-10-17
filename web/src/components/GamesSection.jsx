import React from 'react';
import { MiniBattleBoard } from './MiniBattleBoard';
import { playLink } from '../config/links';

const TERRAINS = [
  ['desert', 'Desierto'],
  ['jungle', 'Selva'],
  ['sea', 'Mar'],
  ['sky', 'Cielo'],
  ['arctic', 'Ártico'],
  ['city', 'Ciudad'],
];

/** "Elige tu juego": los dos juegos de WordHive, cada uno con su enlace directo. */
export function GamesSection() {
  return (
    <section className="section games" id="juegos" aria-labelledby="games-title">
      <div className="section-header">
        <p className="section-tag">Dos juegos, una cuenta</p>
        <h2 className="section-title" id="games-title">Elige tu juego</h2>
        <p>Tus amigos, tu avatar y tus avisos sirven para los dos.</p>
      </div>

      <div className="games__grid">
        <article className="game-tile">
          <div className="game-tile__head">
            <span className="game-tile__art game-tile__art--letters" aria-hidden="true">
              {'SOPA'.split('').map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
            <h3>Sopa de letras</h3>
          </div>
          <p>Encuentra las palabras antes que tus amigos. Juega solo, en carrera o crea tus propias sopas.</p>
          <a className="btn btn--primary" href={playLink('juegos/sopa')}>Jugar la sopa</a>
        </article>

        <article className="game-tile game-tile--new">
          <span className="game-tile__ribbon">¡Nuevo!</span>
          <div className="game-tile__head">
            <span className="game-tile__art game-tile__art--battle" aria-hidden="true">
              <img src="/batalla/tank_r.webp" alt="" />
            </span>
            <h3>La Batalla Más Temida</h3>
          </div>
          <p>
            El clásico de papel y lápiz, ahora en tu pantalla. Esconde tu ejército, dispara por coordenadas
            (como «11-H») y usa misiles, bombardeos o el radar. Figuras en 3D, seis terrenos con su propio ejército y explosiones de verdad. Juega contra un amigo o contra la Abejita.
          </p>
          <ul className="game-tile__terrains" aria-label="Terrenos">
            {TERRAINS.map(([id, name]) => (
              <li key={id}>
                <span className="game-tile__swatch" style={{ backgroundImage: `url(/batalla/${id}.webp)` }} />
                {name}
              </li>
            ))}
          </ul>
          <MiniBattleBoard />
          <a className="btn btn--amber" href={playLink('juegos/batalla')}>Ir a la batalla</a>
        </article>
      </div>
    </section>
  );
}
