import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/social_entities.dart';
import '../providers/friends_notifier.dart';
import 'friend_tile_widget.dart';
import 'player_avatar_widget.dart';
import 'presence_label_widget.dart';
import 'social_empty_state_widget.dart';

/// Pestaña "Mis amigos" (US-23): quién está en línea va primero.
class FriendsListTab extends ConsumerWidget {
  final VoidCallback onFindFriends;

  const FriendsListTab({super.key, required this.onFindFriends});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(friendsNotifierProvider);
    final notifier = ref.read(friendsNotifierProvider.notifier);

    if (state.isLoading && state.friends.isEmpty) {
      return const Center(child: CircularProgressIndicator(color: AppColors.accentCyan));
    }
    if (state.friends.isEmpty) {
      return SocialEmptyState(
        icon: Icons.diversity_3_rounded,
        color: AppColors.accentEmerald,
        title: 'Aún no tienes amigos aquí',
        message: 'Busca a tus amigos por su nombre y envíales una solicitud. ¡Jugar juntos es más divertido!',
        actionLabel: 'Buscar amigos',
        onAction: onFindFriends,
      );
    }

    return RefreshIndicator(
      color: AppColors.accentCyan,
      backgroundColor: AppColors.bgCard,
      onRefresh: notifier.load,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 12),
        itemCount: state.friends.length,
        itemBuilder: (context, index) {
          final friend = state.friends[index];
          return SocialTile(
            key: ValueKey(friend.id),
            name: friend.name,
            avatarId: friend.avatarUrl,
            avatar: PlayerAvatar(avatarId: friend.avatarUrl, status: friend.status),
            highlighted: friend.status == PresenceStatus.online,
            subtitle: PresenceLabel(status: friend.status),
            trailing: IconButton(
              tooltip: 'Opciones de ${friend.name}',
              icon: const Icon(Icons.more_horiz_rounded, color: AppColors.textSecondary),
              onPressed: () => _confirmRemove(context, ref, friend),
            ),
          );
        },
      ),
    );
  }

  Future<void> _confirmRemove(BuildContext context, WidgetRef ref, FriendEntity friend) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: Text('¿Quitar a ${friend.name}?'),
        content: const Text('Ya no verás cuándo está en línea ni podrán invitarse. Podrás agregarlo otra vez cuando quieras.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No, dejarlo')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sí, quitar', style: TextStyle(color: AppColors.accentRose)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final message = await ref.read(friendsNotifierProvider.notifier).remove(friend.id);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message ?? '${friend.name} ya no está en tu lista')));
    }
  }
}
