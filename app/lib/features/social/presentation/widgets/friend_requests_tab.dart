import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/social_entities.dart';
import '../providers/friends_notifier.dart';
import 'friend_tile_widget.dart';
import 'social_empty_state_widget.dart';

/// Pestaña "Solicitudes" (US-22): las recibidas arriba y bien visibles,
/// las enviadas abajo con opción de cancelar.
class FriendRequestsTab extends ConsumerWidget {
  const FriendRequestsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(friendsNotifierProvider);
    final notifier = ref.read(friendsNotifierProvider.notifier);

    if (state.incoming.isEmpty && state.outgoing.isEmpty) {
      return const SocialEmptyState(
        emoji: '📭',
        title: 'No hay solicitudes',
        message: 'Cuando alguien quiera ser tu amigo, aparecerá aquí.',
      );
    }

    Future<void> run(Future<String?> Function() action) async {
      final message = await action();
      if (message != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      }
    }

    return RefreshIndicator(
      color: AppColors.accentCyan,
      backgroundColor: AppColors.bgCard,
      onRefresh: notifier.load,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          if (state.incoming.isNotEmpty) _header('👋 Quieren ser tus amigos (${state.incoming.length})'),
          for (final request in state.incoming)
            _tile(
              request,
              highlighted: true,
              subtitle: 'Te envió una solicitud',
              actions: [
                SocialActionButton(
                  label: 'Aceptar',
                  icon: Icons.check_rounded,
                  color: AppColors.accentEmerald,
                  busy: state.busyIds.contains(request.id),
                  onPressed: () => run(() => notifier.accept(request.id)),
                ),
                const SizedBox(width: 6),
                IconButton(
                  tooltip: 'Ahora no',
                  icon: const Icon(Icons.close_rounded, color: AppColors.textSecondary),
                  onPressed: state.busyIds.contains(request.id) ? null : () => run(() => notifier.reject(request.id)),
                ),
              ],
            ),
          if (state.outgoing.isNotEmpty) _header('📨 Enviadas, esperando respuesta'),
          for (final request in state.outgoing)
            _tile(
              request,
              subtitle: 'Esperando que acepte',
              actions: [
                SocialActionButton(
                  label: 'Cancelar',
                  icon: Icons.undo_rounded,
                  color: AppColors.textSecondary,
                  filled: false,
                  busy: state.busyIds.contains(request.id),
                  onPressed: () => run(() => notifier.cancel(request.id)),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _header(String text) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 6),
        child: Text(text, style: AppTypography.labelBold.copyWith(color: AppColors.textSecondary)),
      );

  Widget _tile(FriendRequestEntity request, {required String subtitle, required List<Widget> actions, bool highlighted = false}) {
    return SocialTile(
      key: ValueKey(request.id),
      name: request.player.name,
      avatarId: request.player.avatarUrl,
      highlighted: highlighted,
      subtitle: Text(subtitle, style: AppTypography.bodySmall),
      trailing: Row(mainAxisSize: MainAxisSize.min, children: actions),
    );
  }
}
