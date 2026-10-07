import 'dart:async';
import 'package:flutter/foundation.dart';

/// En qué punto está la sesión, visto desde el enrutador.
enum SessionGate { checking, signedIn, signedOut }

/// Portero de las rutas.
///
/// En el móvil siempre se entra por el login, pero en el navegador cualquiera
/// puede recargar en mitad de una partida, escribir `/jugar/home` o abrir un
/// enlace de invitación (`/jugar/room/ABC123`) sin haber iniciado sesión.
/// El portero manda esas visitas al login, recuerda a dónde iban y, en cuanto
/// la sesión está lista, las lleva allí una sola vez.
class AuthRouteGuard extends ChangeNotifier {
  static const publicPaths = {'/login', '/register', '/forgot-pin'};

  SessionGate _session = SessionGate.checking;
  String? _pending;

  SessionGate get session => _session;

  /// El estado cambia al instante (una navegación inmediata ya lo ve), pero
  /// el aviso al enrutador se difiere a una microtarea: puede llegar mientras
  /// Flutter construye la pantalla y el enrutador no admite cambios a mitad de frame.
  void update(SessionGate next) {
    if (next == _session) return;
    _session = next;
    scheduleMicrotask(notifyListeners);
  }

  String? redirect(Uri uri) {
    final path = uri.path;
    final isPublic = publicPaths.contains(path);
    if (_session != SessionGate.signedIn) {
      if (isPublic) return null;
      if (path != '/' && path != '/home') _pending = uri.toString();
      return '/login';
    }
    final pending = _pending;
    if (pending != null) {
      _pending = null;
      if (pending != uri.toString()) return pending;
    }
    // Con sesión no hay nada que hacer en el login: el portero lleva al
    // inicio (o al enlace pendiente), así no compiten varias navegaciones.
    return path == '/' || path == '/login' ? '/home' : null;
  }
}

final authRouteGuard = AuthRouteGuard();
