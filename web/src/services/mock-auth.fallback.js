/**
 * Mock Auth Fallback para pruebas locales offline
 */
export function handleMockAuth(endpoint, data) {
  const storageKey = 'wh_mock_users';
  const users = JSON.parse(localStorage.getItem(storageKey) || '[]');

  if (endpoint === '/auth/register') {
    const existing = users.find((u) => u.email === data.email);
    if (existing) {
      throw new Error('El correo electrónico ya se encuentra registrado');
    }
    const newUser = {
      id: `mock-${Date.now()}`,
      name: data.name,
      email: data.email,
      age: data.age,
      pin: data.pin,
      avatarUrl: data.avatarUrl || 'bee_scout',
      isGuest: false,
    };
    users.push(newUser);
    localStorage.setItem(storageKey, JSON.stringify(users));
    return {
      user: newUser,
      accessToken: `mock-jwt-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  }

  if (endpoint === '/auth/login') {
    const user = users.find((u) => u.email === data.email);
    if (!user) {
      if (data.email === 'demo@wordhive.com' && data.pin === '1234') {
        return {
          user: { id: 'demo-1', name: 'Zumbador', email: data.email, avatarUrl: 'bee_scout', isGuest: false },
          accessToken: 'mock-jwt-demo',
          refreshToken: 'mock-refresh-demo',
        };
      }
      throw new Error('Credenciales inválidas o correo no registrado');
    }
    if (user.pin !== data.pin) {
      throw new Error('PIN incorrecto. Intenta nuevamente.');
    }
    return {
      user,
      accessToken: `mock-jwt-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  }

  if (endpoint === '/auth/guest') {
    const guestUser = {
      id: `guest-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: data.name || `Avispa-${Math.floor(Math.random() * 900 + 100)}`,
      avatarUrl: data.avatarUrl || 'bee_scout',
      isGuest: true,
    };
    return {
      user: guestUser,
      accessToken: `mock-guest-jwt-${Date.now()}`,
      refreshToken: `mock-guest-refresh-${Date.now()}`,
    };
  }

  if (endpoint === '/auth/forgot-pin') {
    localStorage.setItem('wh_mock_otp', JSON.stringify({ email: data.email, otp: '123456' }));
    return { message: 'Código de recuperación enviado. (En modo demo: usa 123456)' };
  }

  if (endpoint === '/auth/reset-pin') {
    if (data.otpCode !== '123456') {
      throw new Error('Código OTP inválido o expirado. (Prueba con 123456)');
    }
    const user = users.find((u) => u.email === data.email);
    if (user) {
      user.pin = data.newPin;
      localStorage.setItem(storageKey, JSON.stringify(users));
    }
    return { message: 'PIN actualizado exitosamente' };
  }

  throw new Error(`Endpoint ${endpoint} no soportado`);
}
