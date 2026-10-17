import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/repositories/battle_repository.dart';

/// Borrador del ejército mientras el jugador lo acomoda. Marca en rojo las
/// figuras que se salen o se tocan (la misma regla que revisa el servidor).
class PlacementState {
  final List<UnitPlacement> units;
  final int? selected;
  final Set<int> conflicts;

  const PlacementState({this.units = const [], this.selected, this.conflicts = const {}});

  bool get isValid => units.isNotEmpty && conflicts.isEmpty;
}

final placementProvider = StateNotifierProvider.autoDispose<PlacementNotifier, PlacementState>((ref) {
  return PlacementNotifier();
});

class PlacementNotifier extends StateNotifier<PlacementState> {
  BattleTerrain? _terrain;
  int _cols = 0;
  int _rows = 0;

  PlacementNotifier() : super(const PlacementState());

  bool get isSeeded => state.units.isNotEmpty;

  void seed(List<UnitPlacement> units, BattleTerrain terrain, int cols, int rows) {
    _terrain = terrain;
    _cols = cols;
    _rows = rows;
    _commit(units, null);
  }

  (int, int) sizeOf(UnitPlacement u) {
    final type = _terrain?.unit(u.typeId);
    final w = type?.width ?? 1;
    final h = type?.height ?? 1;
    return u.rotated ? (h, w) : (w, h);
  }

  /// Índice de la figura que ocupa la casilla, o null.
  int? unitAt(int col, int row) {
    for (var i = 0; i < state.units.length; i++) {
      final u = state.units[i];
      final (w, h) = sizeOf(u);
      if (col >= u.col && col < u.col + w && row >= u.row && row < u.row + h) return i;
    }
    return null;
  }

  void select(int? index) => _commit(state.units, index);

  /// Mueve la figura elegida para que su esquina quede en la casilla, sin salirse.
  void moveSelectedTo(int col, int row) {
    final i = state.selected;
    if (i == null) return;
    final (w, h) = sizeOf(state.units[i]);
    final next = [...state.units];
    next[i] = next[i].copyWith(col: col.clamp(0, _cols - w), row: row.clamp(0, _rows - h));
    _commit(next, i);
  }

  void rotateSelected() {
    final i = state.selected;
    if (i == null) return;
    final next = [...state.units];
    next[i] = next[i].copyWith(rotated: !next[i].rotated);
    final (w, h) = sizeOf(next[i]);
    next[i] = next[i].copyWith(col: next[i].col.clamp(0, _cols - w), row: next[i].row.clamp(0, _rows - h));
    _commit(next, i);
  }

  void _commit(List<UnitPlacement> units, int? selected) {
    state = PlacementState(units: units, selected: selected, conflicts: _conflicts(units));
  }

  Set<int> _conflicts(List<UnitPlacement> units) {
    final bad = <int>{};
    for (var i = 0; i < units.length; i++) {
      final (w, h) = sizeOf(units[i]);
      final a = units[i];
      if (a.col < 0 || a.row < 0 || a.col + w > _cols || a.row + h > _rows) bad.add(i);
      for (var j = i + 1; j < units.length; j++) {
        final (w2, h2) = sizeOf(units[j]);
        final b = units[j];
        // Se tocan si sus rectángulos, agrandados una casilla, se cruzan.
        final apart = a.col + w < b.col || b.col + w2 < a.col || a.row + h < b.row || b.row + h2 < a.row;
        if (!apart) bad.addAll([i, j]);
      }
    }
    return bad;
  }
}
