import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/core/router/auth_route_guard.dart';

void main() {
  group('Portero de rutas (web: recargas y enlaces directos)', () {
    test('sin sesión, una pantalla interna manda al login', () {
      final guard = AuthRouteGuard()..update(SessionGate.signedOut);
      expect(guard.redirect(Uri.parse('/home')), '/login');
      expect(guard.redirect(Uri.parse('/register')), isNull);
    });

    test('el enlace de invitación se recuerda y se abre al entrar, una sola vez', () async {
      final guard = AuthRouteGuard();
      expect(guard.redirect(Uri.parse('/room/ABC123')), '/login');

      guard.update(SessionGate.signedIn);
      expect(guard.redirect(Uri.parse('/login')), '/room/ABC123');
      expect(guard.redirect(Uri.parse('/join-room?code=ABC123')), isNull);
      expect(guard.redirect(Uri.parse('/login')), '/home');
    });

    test('con sesión, la raíz del sitio lleva al inicio', () {
      final guard = AuthRouteGuard()..update(SessionGate.signedIn);
      expect(guard.redirect(Uri.parse('/')), '/home');
      expect(guard.redirect(Uri.parse('/lobby/ABC123')), isNull);
    });
  });
}
