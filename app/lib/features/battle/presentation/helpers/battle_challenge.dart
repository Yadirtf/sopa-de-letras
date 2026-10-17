import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_error.dart';
import '../../../../core/router/app_messenger.dart';
import '../../../social/domain/entities/room_invite_entity.dart';
import '../../../social/domain/entities/social_entities.dart';
import '../../../social/presentation/providers/social_providers.dart';
import '../../domain/entities/battle_config.dart';
import '../providers/battle_setup_notifier.dart';

/// Amigo al que se está retando ahora mismo (para el giro del botón).
final challengingFriendProvider = StateProvider.autoDispose<String?>((_) => null);

/// Retar a un amigo: crea la sala con los ajustes elegidos, le manda el aviso
/// y lleva a la sala de espera. Si el aviso falla, la sala sigue abierta y
/// el código se puede pasar a mano.
Future<void> challengeFriend(BuildContext context, WidgetRef ref, FriendEntity friend) async {
  final busy = ref.read(challengingFriendProvider.notifier);
  busy.state = friend.id;
  final code = await ref.read(battleSetupProvider.notifier).create(BattleOpponent.friend);
  if (code == null) {
    busy.state = null;
    return;
  }
  String message;
  try {
    await ref
        .read(socialRepositoryProvider)
        .inviteToRoom(friendId: friend.id, roomCode: code, game: RoomInviteEntity.battle);
    message = 'Reto enviado a ${friend.name}. La batalla empieza cuando acepte.';
  } catch (e) {
    message = 'Sala lista, pero no pudimos avisar a ${friend.name}: ${friendlyApiError(e)}';
  }
  if (!context.mounted) return;
  busy.state = null;
  context.go('/batalla/$code');
  showRootSnack(message);
}
