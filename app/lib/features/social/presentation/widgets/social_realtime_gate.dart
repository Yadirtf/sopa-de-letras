import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/router/app_messenger.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../../../auth/presentation/providers/auth_state.dart';
import '../../../game/presentation/providers/game_room_notifier.dart';
import '../../../notifications/presentation/providers/notifications_notifier.dart';
import '../../domain/entities/room_invite_entity.dart';
import '../../domain/entities/social_entities.dart';
import '../providers/friends_notifier.dart';
import '../providers/room_invite_actions.dart';
import '../providers/social_providers.dart';
import 'room_invite_banner.dart';

/// Envuelve toda la app: abre el socket social al iniciar sesión, reparte
/// los eventos en tiempo real a sus providers y pinta el banner de
/// invitación encima de cualquier pantalla (US-23, US-24, US-25).
class SocialRealtimeGate extends ConsumerStatefulWidget {
  final Widget child;

  const SocialRealtimeGate({super.key, required this.child});

  @override
  ConsumerState<SocialRealtimeGate> createState() => _SocialRealtimeGateState();
}

class _SocialRealtimeGateState extends ConsumerState<SocialRealtimeGate> {
  final List<StreamSubscription> _subs = [];
  String? _connectedUserId;

  @override
  void initState() {
    super.initState();
    final socket = ref.read(socialSocketProvider);
    _subs.addAll([
      socket.onNotification.listen(ref.read(notificationsNotifierProvider.notifier).onRealtime),
      socket.onFriendPresence.listen((e) => ref
          .read(friendsNotifierProvider.notifier)
          .applyPresence(e['userId'] as String? ?? '', PresenceStatus.parse(e['status'] as String?))),
      socket.onFriendshipUpdated.listen((_) => ref.read(friendsNotifierProvider.notifier).load(silent: true)),
      socket.onRoomInvite.listen(_onInvite),
    ]);
    ref.listenManual<AuthState>(authNotifierProvider, (_, next) => _syncConnection(next), fireImmediately: true);
  }

  Future<void> _syncConnection(AuthState auth) async {
    final userId = auth.isAuthenticated ? auth.user!.id : null;
    if (userId == _connectedUserId) return;
    _connectedUserId = userId;

    final socket = ref.read(socialSocketProvider);
    if (userId == null) {
      socket.disconnect();
      ref.read(friendsNotifierProvider.notifier).reset();
      ref.read(notificationsNotifierProvider.notifier).reset();
      return;
    }
    final token = await SecureStorageService().getAccessToken();
    if (token == null || _connectedUserId != userId) return;
    socket.connect(token);
    ref.read(notificationsNotifierProvider.notifier).refresh();
    if (!auth.user!.isGuest) ref.read(friendsNotifierProvider.notifier).load(silent: true);
  }

  void _onInvite(Map<String, dynamic> event) {
    final invite = RoomInviteEntity.fromJson(event);
    final room = ref.read(gameRoomNotifierProvider).room;
    if (invite.roomCode.isEmpty || room?.code.toUpperCase() == invite.roomCode) return;
    HapticFeedback.mediumImpact();
    SystemSound.play(SystemSoundType.alert);
    ref.read(incomingInviteProvider.notifier).state = invite;
  }

  Future<void> _join(RoomInviteEntity invite) async {
    _dismiss();
    final error = await joinInvitedRoom(ref, invite.roomCode);
    if (error != null) showRootSnack(error);
  }

  void _dismiss() => ref.read(incomingInviteProvider.notifier).state = null;

  @override
  void dispose() {
    for (final s in _subs) {
      s.cancel();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final invite = ref.watch(incomingInviteProvider);
    return Stack(
      children: [
        widget.child,
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: SafeArea(
            bottom: false,
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 350),
              switchInCurve: Curves.easeOutBack,
              transitionBuilder: (child, anim) => SlideTransition(
                position: Tween(begin: const Offset(0, -1.2), end: Offset.zero).animate(anim),
                child: child,
              ),
              child: invite == null
                  ? const SizedBox.shrink()
                  : RoomInviteBanner(
                      key: ValueKey('${invite.roomCode}-${invite.expiresAt.millisecondsSinceEpoch}'),
                      invite: invite,
                      onJoin: () => _join(invite),
                      onDismiss: _dismiss,
                    ),
            ),
          ),
        ),
      ],
    );
  }
}
