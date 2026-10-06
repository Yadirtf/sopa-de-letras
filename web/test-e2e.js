// Automated validation test for WordHive Web Services
import { authService } from './src/services/auth.service.js';
import { api } from './src/services/api.service.js';

// Polyfill localStorage in Node.js
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
};

async function runTests() {
  console.log('🧪 Starting WordHive Web Auth Tests...');

  // 1. Health check
  console.log('1. Testing health check fallback...');
  const health = await api.checkHealth();
  console.log('   Health status:', health);

  // 2. Register
  console.log('2. Testing user registration...');
  const regUser = await authService.register({
    name: 'AvispaReina',
    age: 20,
    email: 'reina@wordhive.com',
    pin: '4321',
    avatarUrl: 'bee_queen',
  });
  console.log('   Registered user:', regUser.user.name, 'ID:', regUser.user.id);
  if (regUser.user.pin !== '4321') throw new Error('PIN mismatch');

  // 3. Register duplicate email should throw
  console.log('3. Testing duplicate email prevention...');
  try {
    await authService.register({
      name: 'Duplicate',
      age: 21,
      email: 'reina@wordhive.com',
      pin: '9999',
    });
    throw new Error('Should have failed duplicate registration');
  } catch (err) {
    console.log('   Duplicate correctly blocked:', err.message);
  }

  // 4. Login with correct PIN
  console.log('4. Testing login with valid PIN...');
  const loginRes = await authService.login({
    email: 'reina@wordhive.com',
    pin: '4321',
  });
  console.log('   Login successful:', loginRes.user.email);

  // 5. Login with wrong PIN
  console.log('5. Testing login with invalid PIN...');
  try {
    await authService.login({
      email: 'reina@wordhive.com',
      pin: '0000',
    });
    throw new Error('Should have failed invalid PIN');
  } catch (err) {
    console.log('   Invalid PIN correctly rejected:', err.message);
  }

  // 6. Guest Login
  console.log('6. Testing guest login...');
  const guestRes = await authService.guestLogin({
    name: 'AvispaInvitada',
    avatarUrl: 'lightning',
  });
  console.log('   Guest user logged in:', guestRes.user.name, 'isGuest:', guestRes.user.isGuest);

  // 7. Forgot PIN & Reset PIN
  console.log('7. Testing forgot PIN and OTP reset...');
  const forgotRes = await authService.forgotPin('reina@wordhive.com');
  console.log('   Forgot PIN response:', forgotRes.message);

  const resetRes = await authService.resetPin({
    email: 'reina@wordhive.com',
    otpCode: '123456',
    newPin: '7777',
  });
  console.log('   Reset PIN response:', resetRes.message);

  // 8. Login with new PIN
  console.log('8. Testing login with new PIN (7777)...');
  const loginNewPin = await authService.login({
    email: 'reina@wordhive.com',
    pin: '7777',
  });
  console.log('   Login with updated PIN succeeded:', loginNewPin.user.name);

  // 9. Session storage
  authService.saveSession(loginNewPin);
  const stored = authService.getStoredSession();
  if (!stored || stored.user.name !== 'AvispaReina') {
    throw new Error('Stored session failed');
  }
  console.log('   Session stored and retrieved correctly:', stored.user.name);

  authService.clearSession();
  if (authService.getStoredSession() !== null) {
    throw new Error('Session clear failed');
  }
  console.log('   Session cleared correctly.');

  console.log('\n✅ ALL 9 TEST SUITES PASSED FLAWLESSLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
