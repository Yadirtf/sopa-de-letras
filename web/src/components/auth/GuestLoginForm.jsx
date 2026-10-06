import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AvatarSelector } from './AvatarSelector';
import { sound } from '../../services/sound.service';

const GUEST_NAMES = ['AvispaVeloz', 'ZumbadorPro', 'CazaLetras', 'ReinaMiel', 'AguijonX', 'Chispita'];

export function GuestLoginForm({ onSwitchToLogin }) {
  const { guestLogin } = useAuth();
  const [avatar, setAvatar] = useState('bee_scout');
  const [name, setName] = useState(() => GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await guestLogin({ name: name.trim() || undefined, avatarUrl: avatar });
    } catch (err) {
      sound.playError();
      setError(err.message || 'Error al iniciar como invitado');
    } finally {
      setLoading(false);
    }
  };

  const rollRandomName = () => {
    sound.playClick();
    const random = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
    setName(`${random}_${Math.floor(Math.random() * 90 + 10)}`);
  };

  return (
    <div className="auth-form-body">
      <p className="auth-header__subtitle" style={{ textAlign: 'center', marginBottom: 16 }}>
        Entra a las salas y juega al instante sin necesidad de correo ni PIN.
      </p>

      {error && (
        <div className="form-alert form-alert--error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />

        <div className="form-group">
          <label className="form-label" htmlFor="guest-name">
            Apodo Temporal
            <button
              type="button"
              onClick={rollRandomName}
              className="btn-link"
              style={{ marginLeft: 8, fontSize: '12px' }}
            >
              🎲 Aleatorio
            </button>
          </label>
          <div className="input-wrapper">
            <span className="input-icon">⚡</span>
            <input
              id="guest-name"
              type="text"
              required
              maxLength={20}
              placeholder="Ej. AvispaVeloz"
              className="form-input"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn--amber btn--block btn--lg">
          <span>{loading ? 'Entrando...' : 'Entrar a Jugar Ahora'}</span>
          <span>⚡</span>
        </button>
      </form>

      <div className="auth-footer-links">
        <div>
          ¿Prefieres guardar tus estadísticas?{' '}
          <button type="button" className="btn-link" onClick={onSwitchToLogin}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
