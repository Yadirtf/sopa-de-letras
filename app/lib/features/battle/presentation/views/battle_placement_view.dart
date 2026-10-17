import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/battle_catalog.dart';
import '../helpers/battle_layers_builder.dart';
import '../providers/battle_match_notifier.dart';
import '../providers/placement_notifier.dart';
import '../widgets/grid/battle_grid.dart';

/// Esconder el ejército: el servidor propone una colocación al azar y el
/// jugador la acomoda. Toca una figura para elegirla y toca dónde ponerla.
class BattlePlacementView extends ConsumerStatefulWidget {
  final String code;
  final BattleCatalog catalog;

  const BattlePlacementView({super.key, required this.code, required this.catalog});

  @override
  ConsumerState<BattlePlacementView> createState() => _BattlePlacementViewState();
}

class _BattlePlacementViewState extends ConsumerState<BattlePlacementView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _shuffle());
  }

  Future<void> _shuffle() async {
    final match = ref.read(battleMatchProvider(widget.code).notifier);
    final view = ref.read(battleMatchProvider(widget.code)).view;
    final layout = await match.randomLayout();
    if (layout == null || view == null || !mounted) return;
    ref
        .read(placementProvider.notifier)
        .seed(layout, widget.catalog.terrain(view.config.terrainId), view.config.cols, view.config.rows);
  }

  void _onTap(int col, int row) {
    final placement = ref.read(placementProvider.notifier);
    final hit = placement.unitAt(col, row);
    if (hit != null) {
      placement.select(hit);
    } else {
      placement.moveSelectedTo(col, row);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(battleMatchProvider(widget.code));
    final view = state.view!;
    final terrain = widget.catalog.terrain(view.config.terrainId);
    final draft = ref.watch(placementProvider);
    final placement = ref.read(placementProvider.notifier);
    final enemy = view.enemy;

    if (view.amReady) {
      return _Waiting(
        text: enemy?.isReady == true
            ? '¡Todo listo! Lanzando la moneda…'
            : '¡Listo! Esperando a que ${enemy?.username ?? 'tu rival'} esconda su ejército…',
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 24),
      children: [
        Text('Esconde tu ejército', style: AppTypography.titleLarge.copyWith(fontSize: 22)),
        const SizedBox(height: 4),
        Text(
          'Toca una figura y luego toca dónde ponerla. Las figuras no se pueden tocar entre sí.',
          style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 10),
        if (!placement.isSeeded)
          const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator()))
        else
          BattleGrid(
            key: const ValueKey('battle-placement-grid'),
            layers: BattleLayersBuilder.placement(view, terrain, draft, placement.sizeOf),
            onCellTap: _onTap,
          ),
        if (draft.conflicts.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text('Las figuras en rojo se tocan con otra. Muévelas un poco.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose)),
          ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              key: const ValueKey('battle-rotate'),
              onPressed: draft.selected == null ? null : placement.rotateSelected,
              icon: const Icon(Icons.rotate_90_degrees_ccw_rounded),
              label: const Text('Girar'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: OutlinedButton.icon(
              key: const ValueKey('battle-shuffle'),
              onPressed: _shuffle,
              icon: const Icon(Icons.casino_rounded),
              label: const Text('Al azar'),
            ),
          ),
        ]),
        const SizedBox(height: 10),
        FilledButton.icon(
          key: const ValueKey('battle-ready'),
          style:
              FilledButton.styleFrom(minimumSize: const Size.fromHeight(52), backgroundColor: AppColors.accentEmerald),
          onPressed: draft.isValid && !state.isBusy
              ? () => ref.read(battleMatchProvider(widget.code).notifier).placeUnits(draft.units)
              : null,
          icon: const Icon(Icons.check_circle_rounded),
          label: const Text('¡Listo!'),
        ),
      ],
    );
  }
}

class _Waiting extends StatelessWidget {
  final String text;
  const _Waiting({required this.text});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.shield_rounded, size: 56, color: AppColors.accentAmber),
          const SizedBox(height: 16),
          Text(text, textAlign: TextAlign.center, style: AppTypography.titleMedium),
          const SizedBox(height: 16),
          const CircularProgressIndicator(),
        ]),
      ),
    );
  }
}
