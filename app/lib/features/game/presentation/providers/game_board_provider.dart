import 'dart:math' as math;
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CellCoord {
  final int row;
  final int col;
  const CellCoord(this.row, this.col);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CellCoord && runtimeType == other.runtimeType && row == other.row && col == other.col;

  @override
  int get hashCode => Object.hash(row, col);
}

class BoardSelectionState {
  final CellCoord? startCell;
  final CellCoord? currentCell;
  final List<CellCoord> selectedCells;
  final String formedWord;

  const BoardSelectionState({
    this.startCell,
    this.currentCell,
    this.selectedCells = const [],
    this.formedWord = '',
  });

  bool get isActive => startCell != null;
}

final gameBoardProvider = StateNotifierProvider.autoDispose<GameBoardNotifier, BoardSelectionState>((ref) {
  return GameBoardNotifier();
});

/// Las 8 direcciones de una sopa de letras, en el orden de los angulos (0, 45, 90... grados).
const _directions = [
  (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1), (-1, 0), (-1, 1), //
];

class GameBoardNotifier extends StateNotifier<BoardSelectionState> {
  GameBoardNotifier() : super(const BoardSelectionState());

  void startSelection(int row, int col, List<List<String>> grid) {
    if (!_inside(row, col, grid)) return;
    HapticFeedback.selectionClick();
    final start = CellCoord(row, col);
    state = BoardSelectionState(
      startCell: start,
      currentCell: start,
      selectedCells: [start],
      formedWord: grid[row][col],
    );
  }

  /// El dedo nunca va perfectamente recto: tomamos el angulo del trazo, lo
  /// "imantamos" a la direccion mas cercana de las 8 y proyectamos la distancia
  /// sobre ella. Asi un trazo torcido sigue marcando la palabra completa.
  void updateSelection(int row, int col, List<List<String>> grid) {
    final start = state.startCell;
    if (start == null || grid.isEmpty) return;
    final dr = row - start.row;
    final dc = col - start.col;

    final cells = <CellCoord>[start];
    if (dr != 0 || dc != 0) {
      final octant = (math.atan2(dr, dc) / (math.pi / 4)).round() % 8;
      final (stepR, stepC) = _directions[octant];
      final steps = ((dr * stepR + dc * stepC) / (stepR * stepR + stepC * stepC)).round();
      for (var i = 1; i <= steps; i++) {
        final r = start.row + stepR * i;
        final c = start.col + stepC * i;
        if (!_inside(r, c, grid)) break;
        cells.add(CellCoord(r, c));
      }
    }

    if (cells.length != state.selectedCells.length) HapticFeedback.selectionClick();
    state = BoardSelectionState(
      startCell: start,
      currentCell: CellCoord(row, col),
      selectedCells: cells,
      formedWord: cells.map((c) => grid[c.row][c.col]).join(),
    );
  }

  BoardSelectionState clearSelection() {
    final previous = state;
    state = const BoardSelectionState();
    return previous;
  }

  static bool _inside(int r, int c, List<List<String>> grid) =>
      r >= 0 && r < grid.length && c >= 0 && c < grid[r].length;
}
