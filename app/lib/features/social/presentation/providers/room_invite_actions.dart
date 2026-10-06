import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/router/app_router.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../../../game/presentation/providers/game_room_notifier.dart';

/// Entra a la sala de una invitación y lleva al lobby.
/// Lo usan el banner flotante y la tarjeta del centro de notificaciones,
/// para que "Unirme" se comporte igual desde cualquier sitio.
/// Devuelve un mensaje amable si no se pudo, o null si todo fue bien.
Future<String?> joinInvitedRoom(WidgetRef ref, String roomCode) async {
  final user = ref.read(authNotifierProvider).user;
  if (user == null) return 'Inicia sesión para unirte a la sala';

  final code = roomCode.toUpperCase();
  final game = ref.read(gameRoomNotifierProvider.notifier);
  final current = ref.read(gameRoomNotifierProvider).room;
  if (current != null && current.code.toUpperCase() != code) game.leaveRoom();

  await game.joinRoom(code: code, userId: user.id, username: user.name, avatarUrl: user.avatarUrl);
  if (ref.read(gameRoomNotifierProvider).errorMessage != null) {
    return 'Esta sala ya no está disponible';
  }
  appRouter.go('/lobby/$code');
  return null;
}
