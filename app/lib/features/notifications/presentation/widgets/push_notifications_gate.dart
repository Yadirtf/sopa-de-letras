import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/router/app_router.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../../../auth/presentation/providers/auth_state.dart';
import '../../../social/presentation/providers/social_providers.dart';
import '../providers/push_actions.dart';
import '../providers/push_providers.dart';
import 'local_push_fallback.dart';
import 'push_permission_sheet.dart';

/// Avisos en la barra del teléfono (o del navegador) para invitaciones y solicitudes.
///
/// - Registra el token FCM del teléfono al iniciar sesión y lo da de baja al salir.
/// - Ofrece activar los avisos con una tarjeta amable (nunca en mitad de una partida).
/// - Sin Firebase configurado, sigue avisando con notificaciones locales
///   mientras la app vive en segundo plano con el socket conectado.
/// - Al tocar un aviso abre el banner de invitación o la pestaña de solicitudes.
class PushNotificationsGate extends ConsumerStatefulWidget {
  final Widget child;

  const PushNotificationsGate({super.key, required this.child});

  @override
  ConsumerState<PushNotificationsGate> createState() => _PushNotificationsGateState();
}

class _PushNotificationsGateState extends ConsumerState<PushNotificationsGate> with WidgetsBindingObserver {
  static const _authRoutes = {'/login', '/register', '/forgot-pin'};
  final List<StreamSubscription> _subs = [];
  final List<Map<String, dynamic>> _pendingTaps = [];
  bool _foreground = true;

  String? get _userId => ref.read(pushDeviceRegistrarProvider).userId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _boot();
  }

  Future<void> _boot() async {
    final system = ref.read(systemNotificationsProvider);
    final push = ref.read(pushMessagingProvider);
    await system.init();
    await push.init();
    if (!mounted) return;
    ref.read(pushEnabledProvider.notifier).state = system.isSupported ? await system.areEnabled() : null;

    for (final launch in [system.takeLaunchPayload(), await push.takeLaunchData()]) {
      if (launch != null && launch.isNotEmpty) _pendingTaps.add(launch);
    }
    _subs.addAll([
      system.onTap.listen(_onTap),
      push.onOpened.listen(_onTap),
      push.onTokenRefresh.listen((t) => ref.read(pushDeviceRegistrarProvider).register(token: t)),
      ref.read(socialSocketProvider).onNotification.listen(_showLocalWhenAway),
    ]);
    ref.listenManual<AuthState>(authNotifierProvider, (_, next) => _syncAuth(next), fireImmediately: true);
  }

  Future<void> _syncAuth(AuthState auth) async {
    final user = auth.isAuthenticated && !auth.user!.isGuest ? auth.user : null;
    final registrar = ref.read(pushDeviceRegistrarProvider);
    if (user?.id == registrar.userId) return;
    if (user == null) return registrar.signOut();

    await registrar.signIn(user.id);
    _whenInsideApp(() {
      _pendingTaps.toList().forEach(_onTap);
      _pendingTaps.clear();
      Future.delayed(const Duration(seconds: 2), _offerPermission);
    });
  }

  Future<void> _offerPermission() async {
    final system = ref.read(systemNotificationsProvider);
    if (!mounted || _userId == null || !system.isSupported) return;
    if (await system.areEnabled()) {
      ref.read(pushEnabledProvider.notifier).state = true;
      return;
    }
    final policy = ref.read(pushPromptPolicyProvider);
    final path = appRouter.routerDelegate.currentConfiguration.uri.path;
    if (path.startsWith('/game') || path.startsWith('/lobby') || !await policy.shouldAsk()) return;
    final context = appRouter.routerDelegate.navigatorKey.currentContext;
    if (context == null || !context.mounted) return;

    await policy.markAsked();
    if (!context.mounted) return;
    if (await showPushPermissionSheet(context)) await enablePushNotifications(ref);
  }

  void _onTap(Map<String, dynamic> data) {
    if (!mounted) return;
    if (_userId == null) {
      _pendingTaps.add(data);
      return;
    }
    _whenInsideApp(() => handlePushTap(ref, data));
  }

  void _showLocalWhenAway(Map<String, dynamic> event) {
    if (_foreground || ref.read(pushMessagingProvider).isReady) return;
    final local = localPushFor(event);
    if (local == null) return;
    ref.read(systemNotificationsProvider).show(title: local.title, body: local.body, tag: local.tag, data: local.data);
  }

  /// Espera a que el usuario haya pasado el login antes de navegar.
  void _whenInsideApp(VoidCallback action) {
    final delegate = appRouter.routerDelegate;
    bool inside() => !_authRoutes.contains(delegate.currentConfiguration.uri.path);
    if (inside()) return action();
    void listener() {
      if (!inside()) {
        delegate.removeListener(listener);
        if (mounted) action();
      }
    }

    delegate.addListener(listener);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    if (_foreground && _userId != null) {
      final system = ref.read(systemNotificationsProvider);
      system.areEnabled().then((on) {
        if (mounted && system.isSupported) ref.read(pushEnabledProvider.notifier).state = on;
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    for (final s in _subs) {
      s.cancel();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
