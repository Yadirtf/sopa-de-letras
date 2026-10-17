import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import 'battle_grid_layers.dart';
import 'battle_grid_painter.dart';

/// Marca del último disparo, distinta para cada arma de la armería:
/// bala = agujero con chispa, misil = estela y cráter en cruz,
/// bombardeo = área quemada, radar = onda verde con el número de casillas ocupadas.
/// [flash] va de 1 (acaba de caer) a 0 (queda la marca tranquila).
class BattleShotPainter {
  final BattleGridPainter grid;
  final Color ink;

  BattleShotPainter(this.grid, this.ink);

  void paint(Canvas canvas, GridShot shot, double flash) {
    final target = grid.cellRect(shot.col, shot.row);
    final area = shot.area.map((c) => grid.cellRect(c.$1, c.$2)).toList();
    switch (shot.weapon) {
      case 'RADAR':
        _radar(canvas, target, flash);
        radarBadge(canvas, grid.cellRect(shot.col - 1, shot.row - 1, 3, 3), shot.radarCount ?? 0);
      case 'BOMBING':
        _outline(canvas, area, AppColors.accentAmber, 0.18 + flash * 0.4);
        _burst(canvas, target, flash, 1.9);
      case 'MISSILE':
        _trail(canvas, target, flash);
        _outline(canvas, area, AppColors.accentAmber, 0.12 + flash * 0.35);
        _burst(canvas, target, flash, 1.3);
      default:
        _burst(canvas, target, flash, 0.7);
    }
  }

  /// Contador de un radar: cuántas casillas ocupadas (sin tocar) había en la zona.
  static void radarBadge(Canvas canvas, Rect zone, int count, {bool faded = false}) {
    final color = AppColors.accentEmerald.withValues(alpha: faded ? 0.45 : 0.9);
    canvas.drawRRect(
      RRect.fromRectAndRadius(zone.deflate(1), const Radius.circular(6)),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = faded ? 1.2 : 2
        ..color = color,
    );
    final badge = Offset(zone.right - 2, zone.top + 2);
    final r = math.max(zone.width * 0.12, 7.0);
    canvas.drawCircle(badge, r, Paint()..color = color);
    final text = TextPainter(
      text: TextSpan(
          text: '$count', style: TextStyle(color: Colors.white, fontSize: r * 1.1, fontWeight: FontWeight.w800)),
      textDirection: TextDirection.ltr,
    )..layout();
    text.paint(canvas, badge - Offset(text.width / 2, text.height / 2));
  }

  void _outline(Canvas canvas, List<Rect> cells, Color color, double alpha) {
    final fill = Paint()..color = color.withValues(alpha: alpha * 0.5);
    final edge = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4
      ..color = color.withValues(alpha: math.min(alpha * 2, 1));
    for (final rect in cells) {
      canvas.drawRect(rect, fill);
      canvas.drawRect(rect.deflate(0.5), edge);
    }
  }

  void _burst(Canvas canvas, Rect target, double flash, double scale) {
    final center = target.center;
    final radius = target.width * scale * (0.5 + flash * 0.6);
    if (flash > 0) {
      canvas.drawCircle(
        center,
        radius,
        Paint()
          ..shader = RadialGradient(colors: [
            AppColors.accentAmber.withValues(alpha: 0.9 * flash),
            AppColors.accentRose.withValues(alpha: 0.6 * flash),
            Colors.transparent,
          ]).createShader(Rect.fromCircle(center: center, radius: radius)),
      );
    }
    final ring = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color = AppColors.accentAmber.withValues(alpha: 0.5 + flash * 0.5);
    canvas.drawCircle(center, target.width * 0.42, ring);
    for (var i = 0; i < 8; i++) {
      final angle = i * math.pi / 4;
      final inner = center + Offset(math.cos(angle), math.sin(angle)) * target.width * 0.45;
      final outer = center + Offset(math.cos(angle), math.sin(angle)) * target.width * (0.6 + flash * 0.25);
      canvas.drawLine(inner, outer, ring);
    }
  }

  void _trail(Canvas canvas, Rect target, double flash) {
    if (flash <= 0) return;
    final start = Offset(target.center.dx - target.width * 3, target.top - target.height * 4);
    final paint = Paint()
      ..strokeWidth = target.width * 0.18
      ..strokeCap = StrokeCap.round
      ..shader = LinearGradient(colors: [Colors.transparent, Colors.white.withValues(alpha: 0.8 * flash)])
          .createShader(Rect.fromPoints(start, target.center));
    canvas.drawLine(start, target.center, paint);
  }

  void _radar(Canvas canvas, Rect target, double flash) {
    for (var i = 1; i <= 3; i++) {
      final t = (flash + i / 3) % 1;
      canvas.drawCircle(
        target.center,
        target.width * (0.6 + t * 1.6),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.6
          ..color = AppColors.accentEmerald.withValues(alpha: (1 - t) * 0.8),
      );
    }
  }
}
