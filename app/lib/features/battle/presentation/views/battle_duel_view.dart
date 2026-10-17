import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_coordinate.dart';
import '../helpers/battle_layers_builder.dart';
import '../helpers/shot_narrator.dart';
import '../providers/battle_match_notifier.dart';
import '../widgets/duel/battle_scoreboard.dart';
import '../widgets/duel/coordinate_input.dart';
import '../widgets/duel/turn_banner.dart';
import '../widgets/duel/weapon_picker.dart';
import '../widgets/grid/battle_grid.dart';
import '../art/battle_art_images.dart';

/// El duelo: arriba el campo enemigo (donde disparas), abajo tu ejército.
/// Tocar una casilla la apunta; tocarla otra vez (o el botón) dispara.
class BattleDuelView extends ConsumerStatefulWidget {
  final String code;
  final BattleCatalog catalog;

  const BattleDuelView({super.key, required this.code, required this.catalog});

  @override
  ConsumerState<BattleDuelView> createState() => _BattleDuelViewState();
}

class _BattleDuelViewState extends ConsumerState<BattleDuelView> {
  (int, int)? _aim;

  Future<bool> _fire(int col, int row) async {
    final ok = await ref.read(battleMatchProvider(widget.code).notifier).shoot(col, row);
    if (ok && mounted) setState(() => _aim = null);
    return ok;
  }

  void _onTap(int col, int row) {
    if (_aim == (col, row)) {
      _fire(col, row);
    } else {
      HapticFeedback.selectionClick();
      setState(() => _aim = (col, row));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(battleMatchProvider(widget.code));
    final notifier = ref.read(battleMatchProvider(widget.code).notifier);
    final view = state.view!;
    final terrain = widget.catalog.terrain(view.config.terrainId);
    final weapon = widget.catalog.weapon(state.weapon);
    final canTap = view.config.allowsTap && view.isMyTurn && !state.isBusy;
    final enemyName = view.enemy?.username ?? 'tu rival';
    final narration = ShotNarrator.describe(view.lastShot, view.myUserId, enemyName: enemyName);

    ref.listen(battleMatchProvider(widget.code).select((s) => s.lastShot?.seq), (_, __) {
      final shot = ref.read(battleMatchProvider(widget.code)).lastShot;
      if (shot != null && shot.anyHit) HapticFeedback.heavyImpact();
    });

    return ListView(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 24),
      children: [
        BattleScoreboard(view: view),
        const SizedBox(height: 10),
        TurnBanner(myTurn: view.isMyTurn, enemyName: enemyName, endsAt: view.turnEndsAt),
        if (narration != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(narration, key: const ValueKey('battle-narration'), style: AppTypography.bodyMedium),
          ),
        const SizedBox(height: 10),
        Text('Campo de $enemyName', style: AppTypography.labelBold.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        BattleGrid(
          key: const ValueKey('battle-enemy-grid'),
          layers: BattleLayersBuilder.enemy(view, terrain, aim: canTap ? _aim : null),
          shotSeq: view.lastShot?.seq ?? 0,
          onCellTap: canTap ? _onTap : null,
        ),
        const SizedBox(height: 10),
        WeaponPicker(
            weapons: widget.catalog.weapons,
            ammo: view.myAmmo,
            selected: state.weapon,
            onSelected: notifier.selectWeapon),
        const SizedBox(height: 10),
        if (canTap && _aim != null)
          FilledButton.icon(
            key: const ValueKey('battle-fire-aim'),
            style:
                FilledButton.styleFrom(backgroundColor: AppColors.accentRose, minimumSize: const Size.fromHeight(48)),
            onPressed: () => _fire(_aim!.$1, _aim!.$2),
            icon: WeaponIcon(weaponId: weapon.id, size: 26),
            label: Text('Lanzar ${weapon.name.toLowerCase()} a ${BattleCoordinate.format(_aim!.$1, _aim!.$2)}'),
          )
        else
          CoordinateInput(
            cols: view.config.cols,
            rows: view.config.rows,
            enabled: view.isMyTurn && !state.isBusy,
            weaponName: weapon.name,
            onFire: _fire,
          ),
        const SizedBox(height: 18),
        Text('Tu ejército', style: AppTypography.labelBold.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        BattleGrid(
          key: const ValueKey('battle-my-grid'),
          layers: BattleLayersBuilder.mine(view, terrain),
          shotSeq: view.lastShot?.seq ?? 0,
          maxCell: 18,
        ),
      ],
    );
  }
}
