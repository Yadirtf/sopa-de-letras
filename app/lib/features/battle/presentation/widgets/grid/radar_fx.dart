import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Zona de 3×3 que barrió un radar, con el número de casillas ocupadas.
void drawRadarZone(Canvas canvas, Rect zone, int count, {bool faded = false}) {
  final color = const Color(0xFF34D399).withValues(alpha: faded ? 0.55 : 0.95);
  final corner = zone.width * 0.18;
  final stroke = Paint()
    ..style = PaintingStyle.stroke
    ..strokeWidth = faded ? 1.6 : 2.4
    ..color = color;
  canvas.drawRect(zone.deflate(1), Paint()..color = color.withValues(alpha: faded ? 0.06 : 0.12));
  for (final p in [zone.topLeft, zone.topRight, zone.bottomLeft, zone.bottomRight]) {
    final sx = p.dx == zone.left ? 1.0 : -1.0, sy = p.dy == zone.top ? 1.0 : -1.0;
    canvas.drawLine(p, p + Offset(corner * sx, 0), stroke);
    canvas.drawLine(p, p + Offset(0, corner * sy), stroke);
  }
  final r = math.max(zone.width * 0.13, 8.0);
  final badge = zone.center;
  canvas.drawCircle(badge, r, Paint()..color = const Color(0xFF052E1C).withValues(alpha: 0.85));
  canvas.drawCircle(badge, r, stroke);
  final text = TextPainter(
    text: TextSpan(text: '$count', style: TextStyle(color: color, fontSize: r * 1.15, fontWeight: FontWeight.w900)),
    textDirection: TextDirection.ltr,
  )..layout();
  text.paint(canvas, badge - Offset(text.width / 2, text.height / 2));
}
