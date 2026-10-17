import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'battle_grid_layers.dart';
import 'battle_grid_painter.dart';
import 'fx_sprite.dart';

/// Explosión (o polvo / chapuzón si no había nada) en una casilla. `k` va de 0 a 1.
void drawImpact(BattleGridPainter grid, Canvas canvas, GridShot shot, int c, int r, double k, double scale) {
  if (k <= 0 || k >= 1) return;
  final fx = grid.art?.fx;
  final center = grid.cellRect(c, r).center;
  final size = grid.cell * scale;
  final rnd = stableRandom(shot.seq, c, r);
  final hit = shot.hits.contains((c, r));
  if (fx != null) {
    drawSprite(canvas, fx['flash']![rnd.nextInt(3)], center, size * (0.8 + k),
        alpha: 0.8 * (1 - span(k, 0, 0.3)), blend: BlendMode.plus);
  }
  canvas.drawCircle(
    center,
    size * (0.2 + k * 1.1),
    Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size * 0.06 * (1 - k)
      ..color = Colors.white.withValues(alpha: 0.6 * (1 - k)),
  );
  if (fx == null) return;
  if (!hit) {
    final water = grid.layers.isWater;
    final tint = water || grid.layers.isAir ? null : Color.lerp(grid.layers.terrain.ground, Colors.white, 0.35);
    for (var i = 0; i < 3; i++) {
      final a = rnd.nextDouble() * math.pi * 2;
      drawSprite(
          canvas, fx['puff']![i], center + Offset(math.cos(a), math.sin(a)) * size * 0.25 * k, size * (0.45 + k * 0.7),
          angle: a, alpha: 0.75 * (1 - k), tint: tint);
    }
    return;
  }
  for (var i = 0; i < 4; i++) {
    final a = rnd.nextDouble() * math.pi * 2, d = rnd.nextDouble() * 0.35;
    final grow = Curves.easeOut.transform(k);
    drawSprite(
        canvas, fx['fire']![i], center + Offset(math.cos(a), math.sin(a)) * size * d * grow, size * (0.7 + grow * 1.5),
        angle: a + k * 2, alpha: (1 - k * k) * 1.0);
  }
  for (var i = 0; i < 2; i++) {
    drawSprite(canvas, fx['smoke']![i + 1], center - Offset(0, size * 0.3 * k), size * (0.8 + k * 1.6),
        angle: i * 2.0 + k, alpha: 0.6 * pulse(k, 0.15, 1));
  }
  final spark = Paint()
    ..strokeWidth = math.max(size * 0.03, 1)
    ..strokeCap = StrokeCap.round
    ..color = const Color(0xFFFFD27A).withValues(alpha: 1 - k);
  for (var i = 0; i < 8; i++) {
    final a = rnd.nextDouble() * math.pi * 2;
    final dir = Offset(math.cos(a), math.sin(a));
    canvas.drawLine(center + dir * size * (0.2 + k * 0.6), center + dir * size * (0.3 + k * 0.9), spark);
  }
}
