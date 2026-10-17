import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_view.dart';
import '../../domain/repositories/battle_repository.dart';
import '../providers/placement_notifier.dart';
import '../widgets/grid/battle_grid_layers.dart';

/// Arma las capas de cada tablero a partir de la vista del servidor.
abstract class BattleLayersBuilder {
  static String _emoji(BattleTerrain t, String typeId) => t.unit(typeId)?.emoji ?? '❔';

  static bool _allHit(Map<String, CellMark> marks, BattleUnitView u) {
    for (var r = u.row; r < u.row + u.height; r++) {
      for (var c = u.col; c < u.col + u.width; c++) {
        if (marks[BattleView.key(c, r)] != CellMark.hit) return false;
      }
    }
    return true;
  }

  /// Tablero rival: mis disparos, mis radares y las figuras que ya cayeron (todas al final).
  static BattleGridLayers enemy(BattleView view, BattleTerrain terrain, {(int, int)? aim}) {
    final shot = view.lastShot;
    return BattleGridLayers(
      cols: view.config.cols,
      rows: view.config.rows,
      terrain: terrain,
      marks: view.enemyMarks,
      scans: view.scans,
      aim: aim,
      lastShot: shot != null && shot.shooterId == view.myUserId ? GridShot.from(shot) : null,
      units: [
        for (final u in view.enemyRevealed)
          GridUnit(
            emoji: _emoji(terrain, u.typeId),
            col: u.col,
            row: u.row,
            width: u.width,
            height: u.height,
            enemy: true,
            destroyed: _allHit(view.enemyMarks, u),
          ),
      ],
    );
  }

  /// Mi tablero: mi ejército y los disparos que recibí.
  static BattleGridLayers mine(BattleView view, BattleTerrain terrain) {
    final shot = view.lastShot;
    return BattleGridLayers(
      cols: view.config.cols,
      rows: view.config.rows,
      terrain: terrain,
      marks: view.myMarks,
      lastShot: shot != null && shot.shooterId != view.myUserId && shot.weapon != 'RADAR' ? GridShot.from(shot) : null,
      units: [
        for (final u in view.myUnits)
          GridUnit(
            emoji: _emoji(terrain, u.typeId),
            col: u.col,
            row: u.row,
            width: u.width,
            height: u.height,
            destroyed: u.isDestroyed,
          ),
      ],
    );
  }

  /// Borrador de colocación: la figura elegida brilla y las que chocan salen en rojo.
  static BattleGridLayers placement(
    BattleView view,
    BattleTerrain terrain,
    PlacementState draft,
    (int, int) Function(UnitPlacement) sizeOf,
  ) {
    return BattleGridLayers(
      cols: view.config.cols,
      rows: view.config.rows,
      terrain: terrain,
      units: [
        for (var i = 0; i < draft.units.length; i++)
          GridUnit(
            emoji: _emoji(terrain, draft.units[i].typeId),
            col: draft.units[i].col,
            row: draft.units[i].row,
            width: sizeOf(draft.units[i]).$1,
            height: sizeOf(draft.units[i]).$2,
            selected: draft.selected == i,
            conflict: draft.conflicts.contains(i),
          ),
      ],
    );
  }
}
