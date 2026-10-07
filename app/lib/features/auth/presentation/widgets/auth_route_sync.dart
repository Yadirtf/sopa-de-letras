import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/router/auth_route_guard.dart';
import '../providers/auth_notifier.dart';
import '../providers/auth_state.dart';

/// Cuenta al portero de rutas ([authRouteGuard]) si hay sesión, para que una
/// recarga del navegador o un enlace directo no se salten el login.
class AuthRouteSync extends ConsumerStatefulWidget {
  final Widget child;

  const AuthRouteSync({super.key, required this.child});

  @override
  ConsumerState<AuthRouteSync> createState() => _AuthRouteSyncState();
}

class _AuthRouteSyncState extends ConsumerState<AuthRouteSync> {
  @override
  void initState() {
    super.initState();
    ref.listenManual<AuthState>(authNotifierProvider, (_, next) => authRouteGuard.update(_gateFor(next)),
        fireImmediately: true);
  }

  SessionGate _gateFor(AuthState auth) => switch (auth.status) {
        AuthStatus.initial => SessionGate.checking,
        AuthStatus.authenticated when auth.user != null => SessionGate.signedIn,
        _ => SessionGate.signedOut,
      };

  @override
  Widget build(BuildContext context) => widget.child;
}
