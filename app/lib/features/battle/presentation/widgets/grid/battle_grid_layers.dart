import 'package:flutter/material.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../../domain/entities/battle_view.dart';

/// Todo lo que se dibuja sobre una arena. Los tableros propio, enemigo y de
/// colocación usan el mismo pintor con distintas capas.
class GridUnit {
  final String emoji;
  final int col;
  final int row;
  final int width;
  final int height;
  final bool enemy;
  final bool destroyed;
  final bool selected;
  final bool conflict;

  const GridUnit({
    required this.emoji,
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

/// Último disparo: se dibuja con la marca de su arma (agujero, cruz, área quemada u onda de radar).
class GridShot {
  final String weapon;
  final int col;
  final int row;
  final List<(int, int)> area;
  final int? radarCount;

  const GridShot({required this.weapon, required this.col, required this.row, required this.area, this.radarCount});

  factory GridShot.from(ShotReportView shot) => GridShot(
        weapon: shot.weapon,
        col: shot.col,
        row: shot.row,
        area: shot.cells.map((c) => (c.col, c.row)).toList(),
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

  /// Color de las marcas: oscuro sobre nieve o arena, claro sobre selva o mar.
  Color get ink => terrain.isLight ? const Color(0xFF1B2230) : const Color(0xFFF0F4FF);
}
