import React, { useEffect, useState } from 'react';
import { api } from '../services/api.service';
import { playLink, PLAY_URL } from '../config/links';

const DIFFICULTY = {
  EASY: { label: 'Fácil', css: 'fácil' },
  MEDIUM: { label: 'Medio', css: 'medio' },
  HARD: { label: 'Difícil', css: 'difícil' },
};

const prettyCategory = (key = '') => key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ');

/**
 * Las sopas mas recientes del catalogo real. Si el servidor no responde la
 * seccion no se muestra: nunca se ensenan datos inventados.
 */
export function CatalogPreview() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    api
      .get('/word-searches', { limit: 6 })
      .then((data) => alive && setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="section catalog-section" id="sopas" aria-labelledby="catalog-title">
      <div className="section-header">
        <span className="section-tag">Recién salidas del panal</span>
        <h2 className="section-title" id="catalog-title">Sopas para jugar ya</h2>
        <p className="section-subtitle">Algunas de las sopas que la comunidad acaba de crear.</p>
      </div>

      <div className="catalog-grid">
        {items.map((item) => {
          const diff = DIFFICULTY[item.difficulty] || DIFFICULTY.MEDIUM;
          return (
            <a className="catalog-card" key={item.id} href={playLink('home')}>
              <div className="catalog-card__header">
                <span className={`diff-badge diff-badge--${diff.css}`}>{diff.label}</span>
                <span className="catalog-card__plays">▶ {item.playCount} partidas</span>
              </div>
              <h3 className="catalog-card__title">{item.title}</h3>
              <div className="catalog-card__meta">
                <span>📐 {item.gridSize}×{item.gridSize}</span>
                <span>🔤 {item.wordCount} palabras</span>
                <span>🏷️ {prettyCategory(item.category)}</span>
              </div>
              <span className="btn btn--outline btn--block btn--sm">Jugar →</span>
            </a>
          );
        })}
      </div>

      <div className="catalog-more">
        <a href={PLAY_URL} className="btn btn--ghost">Ver todas las sopas</a>
      </div>
    </section>
  );
}
