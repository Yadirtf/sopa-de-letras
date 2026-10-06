import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/router/app_messenger.dart';
import '../../../../core/router/shell_navigation.dart';
import '../../../game/presentation/providers/game_room_notifier.dart';
import '../../../social/domain/entities/room_invite_entity.dart';
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

/// Qué hacer al tocar un aviso de la barra (FCM o local). Los datos de FCM
/// llegan siempre como texto, por eso se convierten los números aquí.
void handlePushTap(WidgetRef ref, Map<String, dynamic> data, {DateTime? now}) {
  final id = data['notificationId'];
  if (id is String && id.isNotEmpty) ref.read(notificationsNotifierProvider.notifier).markRead(id);

  switch (data['type']) {
    case 'ROOM_INVITE':
      final invite = RoomInviteEntity.fromJson({
        ...data,
        'expiresAt': int.tryParse('${data['expiresAt'] ?? ''}'),
      }, now: now);
      if (invite.roomCode.isEmpty) return;
      if (invite.secondsLeft(now ?? DateTime.now()) == 0) {
        showRootSnack('La invitación de ${invite.fromName} ya terminó. ¡Pídele otra!');
        return;
      }
      final room = ref.read(gameRoomNotifierProvider).room;
      if (room?.code.toUpperCase() == invite.roomCode) return;
      // El banner global ofrece "Unirme" con su cuenta atrás.
      ref.read(incomingInviteProvider.notifier).state = invite;
    case 'FRIEND_REQUEST':
      openShellLocation('/friends', extra: {'tab': 1});
  }
}
