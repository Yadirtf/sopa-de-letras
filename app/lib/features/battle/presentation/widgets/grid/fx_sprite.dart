import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';

/// Dibuja una partícula (fuego, humo, polvo) centrada, girada y con transparencia.
void drawSprite(Canvas canvas, ui.Image image, Offset center, double size,
    {double angle = 0, double alpha = 1, BlendMode blend = BlendMode.srcOver, Color? tint}) {
  if (alpha <= 0.01 || size <= 0.5) return;
  final paint = Paint()
    ..filterQuality = FilterQuality.medium
    ..blendMode = blend
    ..color = Color.fromRGBO(255, 255, 255, alpha.clamp(0.0, 1.0));
  if (tint != null) paint.colorFilter = ColorFilter.mode(tint, BlendMode.modulate);
  canvas.save();
  canvas.translate(center.dx, center.dy);
  if (angle != 0) canvas.rotate(angle);
  final src = Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble());
  canvas.drawImageRect(image, src, Rect.fromCenter(center: Offset.zero, width: size, height: size), paint);
  canvas.restore();
}

/// Aleatorio estable: la misma casilla y el mismo disparo dan siempre el mismo dibujo.
math.Random stableRandom(int a, int b, [int c = 0]) => math.Random(a * 73856093 ^ b * 19349663 ^ c * 83492791);

/// Curva 0→1→0 para algo que aparece y se apaga dentro de [from, to] del progreso `t`.
double pulse(double t, double from, double to) {
  if (t <= from || t >= to) return 0;
  final x = (t - from) / (to - from);
  return math.sin(x * math.pi);
}

/// Avance 0→1 dentro de [from, to].
double span(double t, double from, double to) => ((t - from) / (to - from)).clamp(0.0, 1.0);
