import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AvatarSelector } from './AvatarSelector';
import { PinPad } from './PinPad';
import { sound } from '../../services/sound.service';

export function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [avatar, setAvatar] = useState('bee_scout');
  const [name, setName] = useState('');
  const [age, setAge] = useState('18');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isPinStep, setIsPinStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContinueToPin = (e) => {
    e?.preventDefault();
    if (name.trim().length < 3) {
      setError('El nombre o apodo debe tener al menos 3 caracteres');
      sound.playError();
      return;
    }
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 5 || numAge > 120) {
      setError('Ingresa una edad válida (entre 5 y 120)');
      sound.playError();
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      sound.playError();
      return;
    }
    setError(null);
    sound.playClick();
    setIsPinStep(true);
  };

  const handleSubmitRegister = async (finalPin = pin) => {
    if (finalPin.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        age: parseInt(age, 10),
        email: email.trim(),
        pin: finalPin,
        avatarUrl: avatar,
      });
    } catch (err) {
      sound.playError();
      setError(err.message || 'Error al crear la cuenta');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-body">
      <div className="auth-step-progress">
        <div className={`step-pill ${!isPinStep ? 'step-pill--active' : ''}`} />
        <div className={`step-pill ${isPinStep ? 'step-pill--active' : ''}`} />
      </div>

      {error && (
        <div className="form-alert form-alert--error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!isPinStep ? (
        <form onSubmit={handleContinueToPin}>
          <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Nombre o Apodo</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="reg-name"
                type="text"
                required
                minLength={3}
                placeholder="Tu apodo de jugador"
                className="form-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-age">Edad</label>
            <div className="input-wrapper">
              <span className="input-icon">🎂</span>
              <input
                id="reg-age"
                type="number"
                min={5}
                max={120}
                required
                className="form-input"
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(null); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Correo Electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="ejemplo@wordhive.com"
                className="form-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg">
            <span>Configurar mi PIN de 4 dígitos</span>
            <span>→</span>
          </button>
        </form>
      ) : (
        <div className="pin-step-wrapper">
          <p className="auth-header__subtitle" style={{ textAlign: 'center', marginBottom: 12 }}>
            Crea tu PIN de acceso para <strong>{name}</strong>
          </p>

          <PinPad
            pin={pin}
            onChange={setPin}
            onComplete={(val) => handleSubmitRegister(val)}
            hasError={!!error}
            disabled={loading}
          />

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => { setIsPinStep(false); setPin(''); setError(null); sound.playClick(); }}
            >
              ← Volver a editar datos
            </button>
          </div>
        </div>
      )}

      <div className="auth-footer-links">
        <div>
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="btn-link" onClick={onSwitchToLogin}>
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}
