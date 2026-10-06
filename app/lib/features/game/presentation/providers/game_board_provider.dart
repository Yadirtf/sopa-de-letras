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
  int get hashCode => row.hashCode ^ col.hashCode;
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

  BoardSelectionState copyWith({
    CellCoord? startCell,
    CellCoord? currentCell,
    List<CellCoord>? selectedCells,
    String? formedWord,
  }) {
    return BoardSelectionState(
      startCell: startCell,
      currentCell: currentCell,
      selectedCells: selectedCells ?? this.selectedCells,
      formedWord: formedWord ?? this.formedWord,
    );
  }
}

final gameBoardProvider =
    StateNotifierProvider<GameBoardNotifier, BoardSelectionState>((ref) {
  return GameBoardNotifier();
});

class GameBoardNotifier extends StateNotifier<BoardSelectionState> {
  GameBoardNotifier() : super(const BoardSelectionState());

  void startSelection(int row, int col, List<List<String>> grid) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;
    HapticFeedback.lightImpact();
    state = BoardSelectionState(
      startCell: CellCoord(row, col),
      currentCell: CellCoord(row, col),
      selectedCells: [CellCoord(row, col)],
      formedWord: grid[row][col],
    );
  }

  void updateSelection(int row, int col, List<List<String>> grid) {
    if (state.startCell == null) return;
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;

    final start = state.startCell!;
    final dr = row - start.row;
    final dc = col - start.col;

    if (dr == 0 && dc == 0) return;

    // Vector direction snapping to 8 directions (horizontal, vertical, diagonal)
    int stepR = 0;
    int stepC = 0;

    final absR = dr.abs();
    final absC = dc.abs();

    if (absR == 0) {
      stepC = dc > 0 ? 1 : -1;
    } else if (absC == 0) {
      stepR = dr > 0 ? 1 : -1;
    } else {
      // Diagonal snapping
      stepR = dr > 0 ? 1 : -1;
      stepC = dc > 0 ? 1 : -1;
    }

    final length = (stepR != 0 && stepC != 0)
        ? (absR + absC) ~/ 2 + 1
        : (absR > 0 ? absR : absC) + 1;

    final newCells = <CellCoord>[];
    final buffer = StringBuffer();

    for (int i = 0; i < length; i++) {
      final r = start.row + stepR * i;
      final c = start.col + stepC * i;
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) break;
      newCells.add(CellCoord(r, c));
      buffer.write(grid[r][c]);
    }

    if (newCells.length != state.selectedCells.length) {
      HapticFeedback.lightImpact();
    }

    state = state.copyWith(
      currentCell: CellCoord(row, col),
      selectedCells: newCells,
      formedWord: buffer.toString(),
    );
  }

  BoardSelectionState clearSelection() {
    final previous = state;
    state = const BoardSelectionState();
    return previous;
  }
}
