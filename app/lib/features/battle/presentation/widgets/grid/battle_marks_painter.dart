import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../domain/entities/battle_view.dart';
import 'battle_grid_painter.dart';
import 'fx_sprite.dart';
import 'radar_fx.dart';

/// Huellas que dejan los disparos: cráteres que arden y humean donde hubo
/// tocado; polvo, agujeros o anillos de agua donde se falló; y los radares.
class BattleMarksPainter {
  final BattleGridPainter grid;

  BattleMarksPainter(this.grid);

  void paint(Canvas canvas) {
    final layers = grid.layers;
    final misses = <(int, int)>[];
    final hits = <(int, int)>[];
    layers.marks.forEach((key, mark) {
      final parts = key.split(',');
      (mark == CellMark.hit ? hits : misses).add((int.parse(parts[0]), int.parse(parts[1])));
    });
    for (final m in misses) {
      _miss(canvas, m.$1, m.$2);
    }
    for (final h in hits) {
      _crater(canvas, h.$1, h.$2);
    }
    for (final h in hits) {
      _burning(canvas, h.$1, h.$2);
    }
    for (final scan in layers.scans) {
      drawRadarZone(canvas, grid.cellRect(scan.col - 1, scan.row - 1, 3, 3), scan.count, faded: true);
    }
  }

  void _miss(Canvas canvas, int c, int r) {
    final rect = grid.cellRect(c, r);
    final rnd = stableRandom(c, r, 1);
    final center = rect.center + Offset(rnd.nextDouble() - 0.5, rnd.nextDouble() - 0.5) * grid.cell * 0.2;
    final cell = grid.cell;
    if (grid.layers.isWater) {
      final ring = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = math.max(cell * 0.05, 1);
      for (var i = 0; i < 2; i++) {
        final t = ((grid.time * 0.35 + i * 0.5 + rnd.nextDouble()) % 1);
        ring.color = Colors.white.withValues(alpha: 0.55 * (1 - t));
        canvas.drawCircle(center, cell * (0.12 + t * 0.32), ring);
      }
      canvas.drawCircle(center, cell * 0.08, Paint()..color = Colors.white.withValues(alpha: 0.7));
      return;
    }
    if (grid.layers.isAir) {
      final puff = grid.art?.fx['smoke'];
      if (puff != null) {
        drawSprite(canvas, puff[rnd.nextInt(puff.length)], center, cell * 0.75,
            alpha: 0.45, angle: rnd.nextDouble() * 6);
      }
      return;
    }
    canvas.drawCircle(
      center,
      cell * 0.3,
      Paint()
        ..shader = RadialGradient(colors: [
          Colors.black.withValues(alpha: 0.55),
          Colors.black.withValues(alpha: 0.25),
          Colors.transparent,
        ], stops: const [
          0.0,
          0.55,
          1.0
        ]).createShader(Rect.fromCircle(center: center, radius: cell * 0.3)),
    );
    final debris = Paint()..color = Colors.black.withValues(alpha: 0.35);
    for (var i = 0; i < 5; i++) {
      final a = rnd.nextDouble() * math.pi * 2, d = cell * (0.3 + rnd.nextDouble() * 0.15);
      canvas.drawCircle(center + Offset(math.cos(a), math.sin(a)) * d, cell * 0.03, debris);
    }
  }

  void _crater(Canvas canvas, int c, int r) {
    final rect = grid.cellRect(c, r);
    final cell = grid.cell;
    if (grid.layers.isAir) return;
    final center = rect.center;
    canvas.drawCircle(
      center,
      cell * 0.62,
      Paint()
        ..shader = RadialGradient(colors: [
          const Color(0xFF0B0806).withValues(alpha: 0.85),
          const Color(0xFF1E140C).withValues(alpha: 0.5),
          Colors.transparent,
        ], stops: const [
          0.0,
          0.5,
          1.0
        ]).createShader(Rect.fromCircle(center: center, radius: cell * 0.62)),
    );
  }

  /// Llamas que parpadean y una columna de humo que sube y se deshace.
  void _burning(Canvas canvas, int c, int r) {
    final fx = grid.art?.fx;
    if (fx == null) return;
    final rect = grid.cellRect(c, r);
    final cell = grid.cell;
    final rnd = stableRandom(c, r, 2);
    final phase = rnd.nextDouble() * 10;
    final t = grid.time + phase;
    final smoke = fx['smoke']!;
    for (var i = 0; i < 2; i++) {
      final life = ((t * 0.3 + i * 0.5) % 1);
      final drift = Offset(-0.25 * life, -0.9 * life) * cell;
      drawSprite(canvas, smoke[(i + rnd.nextInt(4)) % smoke.length], rect.center + drift, cell * (0.8 + life * 1.3),
          angle: t * 0.4 + i, alpha: 0.7 * (1 - life));
    }
    final fire = fx['fire']!;
    for (var i = 0; i < 2; i++) {
      final flicker = 0.75 + 0.25 * math.sin(t * (9 + i * 3) + i);
      drawSprite(canvas, fire[(i + (t * 6).floor()) % fire.length], rect.center + Offset(i * 0.12 - 0.06, -0.05) * cell,
          cell * 0.95 * flicker,
          angle: t * 1.5 + i * 2, alpha: 0.95);
    }
  }
}
