import '../../../domain/entities/battle_catalog.dart';
import '../../../domain/entities/battle_view.dart';

/// Todo lo que se dibuja sobre una arena. Los tableros propio, enemigo y de
/// colocación usan el mismo pintor con distintas capas.
class GridUnit {
  final String typeId;
  final bool rotated;
  final int col;
  final int row;
  final int width;
  final int height;
  final bool enemy;
  final bool destroyed;
  final bool selected;
  final bool conflict;

  const GridUnit({
    required this.typeId,
    this.rotated = false,
    required this.col,
    required this.row,
    required this.width,
    required this.height,
    this.enemy = false,
    this.destroyed = false,
    this.selected = false,
    this.conflict = false,
  });
}

/// Último disparo: se anima según su arma (bala trazadora, misil, bombardeo o barrido de radar).
class GridShot {
  final int seq;
  final String weapon;
  final int col;
  final int row;
  final List<(int, int)> area;
  final Set<(int, int)> hits;
  final int? radarCount;

  const GridShot({
    this.seq = 0,
    required this.weapon,
    required this.col,
    required this.row,
    required this.area,
    this.hits = const {},
    this.radarCount,
  });

  factory GridShot.from(ShotReportView shot) => GridShot(
        seq: shot.seq,
        weapon: shot.weapon,
        col: shot.col,
        row: shot.row,
        area: shot.cells.map((c) => (c.col, c.row)).toList(),
        hits: {
          for (final c in shot.cells)
            if (c.result == 'HIT') (c.col, c.row)
        },
        radarCount: shot.radarCount,
      );
}

class BattleGridLayers {
  final int cols;
  final int rows;
  final BattleTerrain terrain;
  final List<GridUnit> units;
  final Map<String, CellMark> marks;
  final List<RadarScanView> scans;
  final GridShot? lastShot;
  final (int, int)? aim;

  const BattleGridLayers({
    required this.cols,
    required this.rows,
    required this.terrain,
    this.units = const [],
    this.marks = const {},
    this.scans = const [],
    this.lastShot,
    this.aim,
  });

  bool get isWater => terrain.id == 'SEA';
  bool get isAir => terrain.id == 'SKY';
}
