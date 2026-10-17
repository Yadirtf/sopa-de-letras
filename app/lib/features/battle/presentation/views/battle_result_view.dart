import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_view.dart';
import '../helpers/battle_layers_builder.dart';
import '../providers/battle_match_notifier.dart';
import '../widgets/grid/battle_grid.dart';

/// Final: quién ganó, por qué, puntos y precisión, y dónde estaba escondido el rival.
class BattleResultView extends ConsumerWidget {
  final String code;
  final BattleCatalog catalog;

  const BattleResultView({super.key, required this.code, required this.catalog});

  String _reason(BattleView view) => switch (view.endReason) {
        'SURRENDER' => view.iWon ? 'Tu rival se retiró.' : 'Te retiraste de la batalla.',
        'IDLE' => view.iWon ? 'Tu rival dejó pasar 3 turnos.' : 'Dejaste pasar 3 turnos seguidos.',
        _ => view.iWon ? 'Destruiste todo el ejército rival.' : 'Destruyeron todo tu ejército.',
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(battleMatchProvider(code));
    final view = state.view!;
    final notifier = ref.read(battleMatchProvider(code).notifier);
    final enemy = view.enemy;
    final waitingRematch = view.iVotedRematch;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(view.iWon ? '🏆' : '🎖️', textAlign: TextAlign.center, style: const TextStyle(fontSize: 64)),
        Text(
          view.iWon ? '¡Ganaste la batalla!' : '¡Buena batalla!',
          key: const ValueKey('battle-result-title'),
          textAlign: TextAlign.center,
          style: AppTypography.titleLarge
              .copyWith(fontSize: 26, color: view.iWon ? AppColors.accentAmber : AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(_reason(view),
            textAlign: TextAlign.center, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: _stats('Tú', view.me)),
          const SizedBox(width: 10),
          Expanded(child: _stats(enemy?.username ?? 'Rival', enemy)),
        ]),
        const SizedBox(height: 16),
        Text('Así estaba escondido ${enemy?.username ?? 'tu rival'}',
            style: AppTypography.labelBold.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        BattleGrid(layers: BattleLayersBuilder.enemy(view, catalog.terrain(view.config.terrainId)), maxCell: 22),
        const SizedBox(height: 18),
        FilledButton.icon(
          key: const ValueKey('battle-rematch'),
          style:
              FilledButton.styleFrom(minimumSize: const Size.fromHeight(52), backgroundColor: AppColors.accentViolet),
          onPressed: waitingRematch || state.isBusy ? null : notifier.rematch,
          icon: const Icon(Icons.replay_rounded),
          label: Text(waitingRematch ? 'Esperando a tu rival…' : 'Revancha'),
        ),
        const SizedBox(height: 10),
        OutlinedButton.icon(
          key: const ValueKey('battle-home'),
          style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
          onPressed: () => context.go('/home'),
          icon: const Icon(Icons.home_rounded),
          label: const Text('Volver al inicio'),
        ),
      ],
    );
  }

  Widget _stats(String name, BattlePlayerInfo? p) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14)),
      child: Column(children: [
        Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.labelBold),
        const SizedBox(height: 6),
        Text('${p?.score ?? 0} pts', style: AppTypography.titleMedium.copyWith(color: AppColors.accentAmber)),
        Text('${p?.accuracy ?? 0} % de puntería',
            style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
        Text('${p?.unitsAlive ?? 0} figuras en pie',
            style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
      ]),
    );
  }
}
