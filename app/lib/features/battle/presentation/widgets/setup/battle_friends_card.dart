import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../auth/presentation/providers/auth_notifier.dart';
import '../../../../social/domain/entities/social_entities.dart';
import '../../../../social/presentation/providers/friends_notifier.dart';
import '../../../../social/presentation/widgets/friend_tile_widget.dart';
import '../../../../social/presentation/widgets/player_avatar_widget.dart';
import '../../../../social/presentation/widgets/presence_label_widget.dart';

/// "Tus amigos": quién está en línea ahora mismo y un botón para retarlo.
/// Retar crea la sala con los ajustes de abajo y le llega el aviso al amigo.
class BattleFriendsCard extends ConsumerStatefulWidget {
  final ValueChanged<FriendEntity> onChallenge;
  final String? busyFriendId;

  const BattleFriendsCard({super.key, required this.onChallenge, this.busyFriendId});

  @override
  ConsumerState<BattleFriendsCard> createState() => _BattleFriendsCardState();
}

class _BattleFriendsCardState extends ConsumerState<BattleFriendsCard> {
  @override
  void initState() {
    super.initState();
    final guest = ref.read(authNotifierProvider).user?.isGuest ?? true;
    if (!guest) Future.microtask(() => ref.read(friendsNotifierProvider.notifier).load(silent: true));
  }

  @override
  Widget build(BuildContext context) {
    final guest = ref.watch(authNotifierProvider).user?.isGuest ?? true;
    final friends = ref.watch(friendsNotifierProvider).friends;
    final active = friends.where((f) => f.status != PresenceStatus.offline).toList();
    final online = friends.where((f) => f.status == PresenceStatus.online).length;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.accentAmber.withValues(alpha: 0.35)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.groups_rounded, color: AppColors.accentAmber),
          const SizedBox(width: 8),
          Expanded(child: Text('Reta a un amigo', style: AppTypography.titleMedium.copyWith(fontSize: 17))),
          if (!guest && friends.isNotEmpty)
            Text('$online en línea',
                key: const ValueKey('battle-friends-online'),
                style: AppTypography.labelBold.copyWith(color: AppColors.accentEmerald, fontSize: 13)),
        ]),
        const SizedBox(height: 4),
        if (guest)
          _hint('Crea tu cuenta gratis para tener amigos, ver quién está en línea y retarlos.', 'Crear mi cuenta',
              () => context.push('/register'))
        else if (friends.isEmpty)
          _hint('Aún no tienes amigos agregados.', 'Buscar amigos', () => context.go('/friends'))
        else if (active.isEmpty)
          _hint('Ninguno de tus ${friends.length} amigos está conectado ahora. Crea la sala y pásales el código.', null,
              null)
        else ...[
          Text('Elige tu ejército abajo y toca Retar: le llega el aviso al instante.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
          for (final friend in active) _tile(friend),
          if (friends.length > active.length)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text('${friends.length - active.length} desconectados',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
            ),
        ],
      ]),
    );
  }

  Widget _tile(FriendEntity friend) => Padding(
        key: ValueKey('battle-friend-${friend.id}'),
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(children: [
          PlayerAvatar(avatarId: friend.avatarUrl, status: friend.status, size: 40),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(friend.name, style: AppTypography.labelBold.copyWith(fontSize: 15), overflow: TextOverflow.ellipsis),
              PresenceLabel(status: friend.status),
            ]),
          ),
          friend.status == PresenceStatus.online
              ? SocialActionButton(
                  label: 'Retar',
                  icon: Icons.gps_fixed_rounded,
                  color: AppColors.accentAmber,
                  busy: widget.busyFriendId == friend.id,
                  onPressed: widget.busyFriendId == null ? () => widget.onChallenge(friend) : null,
                )
              : Text('En partida', style: AppTypography.bodySmall),
        ]),
      );

  Widget _hint(String text, String? action, VoidCallback? onAction) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(children: [
          Expanded(child: Text(text, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary))),
          if (action != null) TextButton(onPressed: onAction, child: Text(action)),
        ]),
      );
}
