import React, { useState, useEffect } from 'react';
import { api } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound.service';

export function QaStatusBar() {
  const { user, login, logout, openAuth, showToast } = useAuth();
  const [backendUp, setBackendUp] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      const ok = await api.checkHealth();
      if (mounted) setBackendUp(ok);
    };
    probe();
    const interval = setInterval(probe, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleQuickDemoLogin = async () => {
    sound.playClick();
    try {
      await login('demo@wordhive.com', '1234');
    } catch {
      showToast('Prueba con registro directo si no existe el demo', 'info');
      openAuth('register');
    }
  };

  if (minimized) {
    return (
      <div className="qa-bar qa-bar--minimized">
        <button
          type="button"
          className="qa-bar__btn"
          onClick={() => setMinimized(false)}
        >
          🛠️ QA Panel {backendUp ? '🟢' : '🟡'}
        </button>
      </div>
    );
  }

  return (
    <aside className="qa-bar" aria-label="Panel de estado de desarrollo">
      <div className="qa-bar__status">
        <span className={`qa-bar__dot ${backendUp ? '' : 'qa-bar__dot--offline'}`} />
        <span>{backendUp ? 'Backend Fastify: Conectado' : 'Modo Demo Activo'}</span>
      </div>

      {!user ? (
        <button
          type="button"
          className="qa-bar__btn"
          onClick={handleQuickDemoLogin}
          title="Inicia sesión instantánea de prueba con demo@wordhive.com y PIN 1234"
        >
          👤 Login Demo
        </button>
      ) : (
        <button
          type="button"
          className="qa-bar__btn"
          onClick={logout}
          title="Limpiar la sesión actual"
        >
          🚪 Salir ({user.name})
        </button>
      )}

      <button
        type="button"
        className="qa-bar__btn"
        onClick={() => openAuth('forgot')}
        title="Probar recuperación de contraseña/PIN"
      >
        🔑 Test OTP
      </button>

      <button
        type="button"
        className="btn-link"
        style={{ color: 'var(--wh-text-secondary)', fontSize: '11px', marginLeft: 4 }}
        onClick={() => setMinimized(true)}
        aria-label="Minimizar panel QA"
      >
        ✕
      </button>
    </aside>
  );
}
