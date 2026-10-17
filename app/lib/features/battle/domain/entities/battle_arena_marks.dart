// Piezas sueltas de la arena: figuras, marcas, radar y el último disparo.

/// Figura sobre la arena (propia, o del rival ya destruida / revelada al final).
class BattleUnitView {
  final String typeId;
  final int col;
  final int row;
  final int width;
  final int height;
  final bool rotated;
  final Set<String> hitCells;

  const BattleUnitView({
    required this.typeId,
    required this.col,
    required this.row,
    required this.width,
    required this.height,
    this.rotated = false,
    this.hitCells = const {},
  });

  bool get isDestroyed => hitCells.length >= width * height;

  bool covers(int c, int r) => c >= col && c < col + width && r >= row && r < row + height;
}

enum CellMark { hit, miss }

class RadarScanView {
  final int col;
  final int row;
  final int count;
  const RadarScanView({required this.col, required this.row, required this.count});
}

class ShotCellView {
  final int col;
  final int row;
  final String result; // HIT, MISS, SCAN
  const ShotCellView({required this.col, required this.row, required this.result});
}

class ShotReportView {
  final int seq;
  final String shooterId;
  final String weapon;
  final int col;
  final int row;
  final List<ShotCellView> cells;
  final int destroyedCount;
  final int? radarCount;
  final bool keepsTurn;

  const ShotReportView({
    required this.seq,
    required this.shooterId,
    required this.weapon,
    required this.col,
    required this.row,
    required this.cells,
    required this.destroyedCount,
    this.radarCount,
    required this.keepsTurn,
  });

  bool get anyHit => cells.any((c) => c.result == 'HIT');
}
