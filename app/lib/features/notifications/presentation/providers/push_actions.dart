import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/router/app_messenger.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/router/shell_navigation.dart';
import '../../../game/presentation/providers/game_room_notifier.dart';
import '../../../social/presentation/providers/room_invite_actions.dart';
import '../../../social/presentation/providers/social_providers.dart';
import 'notifications_notifier.dart';
import 'push_providers.dart';

/// Pide el permiso del sistema y guarda el resultado. Si Android ya no
/// deja mostrar el diálogo (lo negaron dos veces), explica dónde activarlo.
Future<bool> enablePushNotifications(WidgetRef ref) async {
  final granted = await ref.read(systemNotificationsProvider).requestPermission();
  ref.read(pushEnabledProvider.notifier).state = granted;
  if (!granted) {
    showRootSnack('Puedes activarlos en Ajustes › Apps › WordHive › Notificaciones');
  }
  return granted;
}

/// Qué hacer al tocar un aviso de la barra (FCM o local): llevar directo a
/// la pantalla de ese aviso, como al tocar un mensaje de WhatsApp.
Future<void> handlePushTap(WidgetRef ref, Map<String, dynamic> data) async {
  final id = data['notificationId'];
  if (id is String && id.isNotEmpty) ref.read(notificationsNotifierProvider.notifier).markRead(id);

  switch (data['type']) {
    case 'ROOM_INVITE':
      final code = '${data['roomCode'] ?? ''}'.toUpperCase();
      if (code.isEmpty) return;
      ref.read(incomingInviteProvider.notifier).state = null;
      final room = ref.read(gameRoomNotifierProvider).room;
      if (room?.code.toUpperCase() == code) {
        appRouter.go('/lobby/$code');
        return;
      }
      // Aunque el banner ya haya caducado, la sala puede seguir esperando
      // en el lobby: intentamos entrar y solo avisamos si ya no existe.
      final error = await joinInvitedRoom(ref, code);
      if (error != null) showRootSnack(error);
    case 'FRIEND_REQUEST':
      openShellLocation('/friends', extra: {'tab': 1});
    case 'FRIEND_ACCEPTED':
      openShellLocation('/friends');
    default:
      openShellLocation('/notifications');
  }
}
