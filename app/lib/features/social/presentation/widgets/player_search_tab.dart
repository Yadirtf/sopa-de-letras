import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/social_entities.dart';
import '../providers/friends_notifier.dart';
import '../providers/player_search_notifier.dart';
import 'friend_tile_widget.dart';
import 'social_empty_state_widget.dart';

/// Pestaña "Buscar" (US-22): escribe un nombre y agrega con un toque.
class PlayerSearchTab extends ConsumerWidget {
  const PlayerSearchTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerSearchNotifierProvider);
    final notifier = ref.read(playerSearchNotifierProvider.notifier);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            autofocus: false,
            textInputAction: TextInputAction.search,
            onChanged: notifier.onQueryChanged,
            style: AppTypography.bodyLarge,
            decoration: InputDecoration(
              hintText: 'Escribe el nombre de tu amigo',
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.accentCyan),
              suffixIcon: state.isSearching
                  ? const Padding(
                      padding: EdgeInsets.all(14),
                      child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : null,
              filled: true,
              fillColor: AppColors.bgCard,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            ),
          ),
        ),
        Expanded(child: _results(context, ref, state, notifier)),
      ],
    );
  }

  Widget _results(BuildContext context, WidgetRef ref, PlayerSearchState state, PlayerSearchNotifier notifier) {
    if (state.isTooShort) {
      return const SocialEmptyState(emoji: '🔎', title: '¿A quién buscas?', message: 'Escribe al menos 2 letras de su nombre.');
    }
    if (!state.isSearching && state.results.isEmpty) {
      return const SocialEmptyState(
        emoji: '🤔',
        title: 'No encontramos a nadie',
        message: 'Revisa cómo se escribe el nombre o pídele a tu amigo que te busque a ti.',
      );
    }
    return ListView.builder(
      itemCount: state.results.length,
      itemBuilder: (context, index) {
        final player = state.results[index];
        return SocialTile(
          key: ValueKey(player.id),
          name: player.name,
          avatarId: player.avatarUrl,
          subtitle: Text(_relationText(player.relation), style: AppTypography.bodySmall),
          trailing: _action(context, ref, player, state.busyIds.contains(player.id), notifier),
        );
      },
    );
  }

  Widget? _action(BuildContext context, WidgetRef ref, PlayerSearchResultEntity player, bool busy, PlayerSearchNotifier notifier) {
    Future<void> add() async {
      final message = await notifier.add(player.id);
      ref.read(friendsNotifierProvider.notifier).load(silent: true);
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }

    return switch (player.relation) {
      RelationStatus.none => SocialActionButton(
          label: 'Agregar', icon: Icons.person_add_alt_1_rounded, color: AppColors.accentViolet, busy: busy, onPressed: add),
      RelationStatus.requestReceived => SocialActionButton(
          label: 'Aceptar', icon: Icons.check_rounded, color: AppColors.accentEmerald, busy: busy, onPressed: add),
      RelationStatus.requestSent => const Icon(Icons.schedule_send_rounded, color: AppColors.textSecondary),
      RelationStatus.friends => const Icon(Icons.favorite_rounded, color: AppColors.accentRose),
    };
  }

  String _relationText(RelationStatus relation) => switch (relation) {
        RelationStatus.none => 'Toca «Agregar» para enviar solicitud',
        RelationStatus.requestReceived => '¡Ya te envió una solicitud!',
        RelationStatus.requestSent => 'Solicitud enviada',
        RelationStatus.friends => 'Ya son amigos',
      };
}
