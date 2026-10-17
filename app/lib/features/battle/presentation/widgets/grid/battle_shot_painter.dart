import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'battle_grid_layers.dart';
import 'battle_grid_painter.dart';
import 'radar_fx.dart';
import 'explosion_fx.dart';
import 'fx_sprite.dart';

/// Animación del último disparo, distinta para cada arma:
/// bala = trazadora e impacto; misil = vuelo con estela y explosión en cruz;
/// bombardeo = lluvia de bombas, explosiones en cadena y temblor;
/// radar = barrido verde que revela cuántas casillas hay ocupadas.
class BattleShotPainter {
  final BattleGridPainter grid;

  BattleShotPainter(this.grid);

  /// Temblor de la arena durante las explosiones grandes.
  static Offset shake(GridShot? shot, double? t, double cell) {
    if (shot == null || t == null) return Offset.zero;
    final power =
        switch (shot.weapon) { 'BOMBING' => pulse(t, 0.2, 0.75), 'MISSILE' => pulse(t, 0.4, 0.65) * 0.6, _ => 0.0 };
    if (power == 0) return Offset.zero;
    return Offset(math.sin(t * 90), math.cos(t * 71)) * cell * 0.12 * power;
  }

  void paint(Canvas canvas, GridShot shot, double? t) {
    if (t == null) return;
    final target = grid.cellRect(shot.col, shot.row).center;
    switch (shot.weapon) {
      case 'RADAR':
        _radar(canvas, shot, t);
      case 'BOMBING':
        _bombs(canvas, shot, t);
      case 'MISSILE':
        _missile(canvas, shot, target, t);
      default:
        _tracer(canvas, target, t);
        drawImpact(grid, canvas, shot, shot.col, shot.row, span(t, 0.22, 1), 1.0);
    }
  }

  void _tracer(Canvas canvas, Offset target, double t) {
    final k = span(t, 0, 0.25);
    if (k >= 1) return;
    final from = Offset(grid.board.left - grid.cell, grid.board.bottom + grid.cell);
    final head = Offset.lerp(from, target, k)!;
    final tail = Offset.lerp(from, target, math.max(0, k - 0.18))!;
    canvas.drawLine(
      tail,
      head,
      Paint()
        ..strokeWidth = math.max(grid.cell * 0.09, 1.5)
        ..strokeCap = StrokeCap.round
        ..shader = const LinearGradient(colors: [Colors.transparent, Color(0xFFFFE08A)])
            .createShader(Rect.fromPoints(tail, head)),
    );
    canvas.drawCircle(head, grid.cell * 0.08, Paint()..color = Colors.white);
  }

  void _missile(Canvas canvas, GridShot shot, Offset target, double t) {
    final fly = span(t, 0, 0.42);
    final from = Offset(target.dx - grid.cell * 5, grid.board.top - grid.cell * 2);
    final control = Offset((from.dx + target.dx) / 2, from.dy - grid.cell);
    Offset at(double k) => Offset(
          (1 - k) * (1 - k) * from.dx + 2 * (1 - k) * k * control.dx + k * k * target.dx,
          (1 - k) * (1 - k) * from.dy + 2 * (1 - k) * k * control.dy + k * k * target.dy,
        );
    final puff = grid.art?.fx['puff'];
    if (puff != null) {
      for (var i = 0; i < 14; i++) {
        final k = i / 14;
        if (k > fly) break;
        final age = (fly - k) + span(t, 0.42, 1);
        drawSprite(canvas, puff[i % puff.length], at(k), grid.cell * (0.35 + age * 1.1),
            angle: i * 1.3, alpha: 0.55 * (1 - age).clamp(0, 1));
      }
    }
    if (fly < 1) {
      final p = at(fly), q = at(math.max(0, fly - 0.04));
      canvas.drawLine(
          q,
          p,
          Paint()
            ..strokeWidth = grid.cell * 0.16
            ..strokeCap = StrokeCap.round
            ..color = const Color(0xFFE5E7EB));
      canvas.drawCircle(q, grid.cell * 0.12, Paint()..color = const Color(0xFFFFB347).withValues(alpha: 0.9));
    }
    final boom = span(t, 0.4, 1);
    for (var i = 0; i < shot.area.length; i++) {
      final cell = shot.area[i];
      drawImpact(
          grid, canvas, shot, cell.$1, cell.$2, span(boom, i * 0.05, 1), cell == (shot.col, shot.row) ? 1.4 : 1.0);
    }
  }

  void _bombs(Canvas canvas, GridShot shot, double t) {
    for (var i = 0; i < shot.area.length; i++) {
      final cell = shot.area[i];
      final rnd = stableRandom(shot.seq, i, 9);
      final delay = 0.12 + rnd.nextDouble() * 0.3;
      final fall = span(t, delay - 0.12, delay);
      if (fall < 1) {
        final c = grid.cellRect(cell.$1, cell.$2).center;
        canvas.drawCircle(
            c, grid.cell * 0.32 * (1 - fall) + 1, Paint()..color = Colors.black.withValues(alpha: 0.35 * fall));
      }
      drawImpact(grid, canvas, shot, cell.$1, cell.$2, span(t, delay, math.min(delay + 0.55, 1)), 1.5);
    }
  }

  void _radar(Canvas canvas, GridShot shot, double t) {
    final zone = grid.cellRect(shot.col - 1, shot.row - 1, 3, 3);
    final center = zone.center;
    final radius = zone.width * 0.75;
    final angle = t * math.pi * 4;
    canvas.save();
    canvas.clipRect(zone.inflate(grid.cell * 0.5));
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..shader = SweepGradient(
          transform: GradientRotation(angle),
          colors: [Colors.transparent, const Color(0xFF34D399).withValues(alpha: 0.55 * (1 - span(t, 0.75, 1)))],
          stops: const [0.75, 1.0],
        ).createShader(Rect.fromCircle(center: center, radius: radius)),
    );
    for (var i = 0; i < 3; i++) {
      final k = ((t * 2 + i / 3) % 1);
      canvas.drawCircle(
          center,
          radius * k,
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.5
            ..color = const Color(0xFF34D399).withValues(alpha: (1 - k) * 0.8));
    }
    canvas.restore();
    if (t > 0.5) drawRadarZone(canvas, zone, shot.radarCount ?? 0);
  }
}
