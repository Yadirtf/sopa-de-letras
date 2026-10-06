import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AVATARS } from './AvatarSelector';

export function UserProfileModal() {
  const { user, profileModalOpen, closeProfile, logout } = useAuth();

  if (!profileModalOpen || !user) return null;

  const currentAvatar = AVATARS.find((a) => a.id === user.avatarUrl) || {
    icon: user.isGuest ? '⚡' : '🐝',
    name: 'Jugador',
  };

  return (
    <div className="modal-backdrop" onClick={closeProfile} role="dialog" aria-modal="true">
      <div className="modal-container auth-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeProfile}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="profile-hero">
          <div className="profile-hero__avatar">
            <span>{currentAvatar.icon}</span>
          </div>
          <h2 className="profile-hero__name">{user.name}</h2>
          <div className="profile-hero__badge">
            {user.isGuest ? '⚡ Modo Invitado' : '🏆 Miembro Oficial WordHive'}
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-field">
            <span className="profile-field__label">Identificador</span>
            <span className="profile-field__val">{user.id}</span>
          </div>
          {user.email && (
            <div className="profile-field">
              <span className="profile-field__label">Correo</span>
              <span className="profile-field__val">{user.email}</span>
            </div>
          )}
          {user.age && (
            <div className="profile-field">
              <span className="profile-field__label">Edad</span>
              <span className="profile-field__val">{user.age} años</span>
            </div>
          )}
          <div className="profile-field">
            <span className="profile-field__label">Seguridad</span>
            <span className="profile-field__val" style={{ color: 'var(--wh-accent-emerald)' }}>
              {user.isGuest ? 'Sesión volátil' : 'PIN de 4 dígitos activo'}
            </span>
          </div>
        </div>

        {/* Estadísticas de juego simuladas para inmersión */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <span className="profile-stat-box__val">12</span>
            <span className="profile-stat-box__lbl">Sopas Ganadas</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-box__val">0:48</span>
            <span className="profile-stat-box__lbl">Mejor Tiempo</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-box__val">1,420</span>
            <span className="profile-stat-box__lbl">Puntos ELO</span>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={closeProfile}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="btn btn--primary btn--block"
            style={{ background: 'var(--wh-accent-rose)', borderColor: 'var(--wh-accent-rose)' }}
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
