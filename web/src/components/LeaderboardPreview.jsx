import React from 'react';

const TOP_PLAYERS = [
  { rank: 2, name: 'CyberQueen', avatar: '👑', score: '3,840 pts', winRate: '78%', badge: 'Plata' },
  { rank: 1, name: 'AbejaMaestra', avatar: '🐝', score: '4,520 pts', winRate: '89%', badge: 'Campeón' },
  { rank: 3, name: 'FlashWord', avatar: '⚡', score: '3,410 pts', winRate: '72%', badge: 'Bronce' },
];

export function LeaderboardPreview() {
  return (
    <section className="section" id="ranking" aria-labelledby="leaderboard-title">
      <div className="section-header">
        <span className="section-tag">Ranking Global en Vivo</span>
        <h2 className="section-title" id="leaderboard-title">Podio de Campeones</h2>
        <p className="section-subtitle">
          Los mejores rastreadores de palabras de la temporada actual.
        </p>
      </div>

      <div className="leaderboard-podium">
        {TOP_PLAYERS.map((p) => {
          const isFirst = p.rank === 1;
          return (
            <div
              key={p.name}
              className={`podium-card podium-card--rank-${p.rank} ${isFirst ? 'podium-card--champion' : ''}`}
            >
              <div className="podium-card__rank-badge">
                {isFirst ? '🥇 #1' : p.rank === 2 ? '🥈 #2' : '🥉 #3'}
              </div>
              <div className="podium-card__avatar">{p.avatar}</div>
              <h3 className="podium-card__name">{p.name}</h3>
              <div className="podium-card__score">{p.score}</div>
              <div className="podium-card__rate">{p.winRate} de victorias</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
