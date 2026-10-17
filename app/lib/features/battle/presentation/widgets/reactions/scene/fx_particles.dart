import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import 'choreo.dart';

/// Capa de pantalla completa dibujada a mano en cada cuadro.
Widget painted(void Function(Canvas canvas, Size size) draw) => Positioned.fill(child: CustomPaint(painter: _Fn(draw)));

class _Fn extends CustomPainter {
  final void Function(Canvas, Size) draw;
  _Fn(this.draw);

  @override
  void paint(Canvas canvas, Size size) => draw(canvas, size);

  @override
  bool shouldRepaint(_Fn old) => true;
}

/// Pseudoaleatorio estable: la misma partícula cae igual en cada cuadro.
double _r(int i, int salt) => (math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

/// Rayos de luz girando detrás de algo (trofeo, medalla, gafas de sol).
Widget rays(Offset at, double s, Color color, double strength, {int count = 12, double speed = 0.35}) => strength <= 0
    ? const SizedBox.shrink()
    : painted((canvas, size) {
        final len = math.max(size.width, size.height);
        final paint = Paint()
          ..shader = RadialGradient(colors: [color.withValues(alpha: 0.55 * strength), color.withValues(alpha: 0)])
              .createShader(Rect.fromCircle(center: at, radius: len * 0.6));
        for (var i = 0; i < count; i++) {
          final a = i * 2 * math.pi / count + s * speed;
          final path = Path()
            ..moveTo(at.dx, at.dy)
            ..lineTo(at.dx + math.cos(a - 0.09) * len, at.dy + math.sin(a - 0.09) * len)
            ..lineTo(at.dx + math.cos(a + 0.09) * len, at.dy + math.sin(a + 0.09) * len)
            ..close();
          canvas.drawPath(path, paint);
        }
      });

/// Confeti que estalla en [at] y cae con vaivén; [p] de 0 a 1.
Widget confetti(Offset at, double p, List<Color> colors, {int count = 70}) => p <= 0 || p >= 1
    ? const SizedBox.shrink()
    : painted((canvas, size) {
        for (var i = 0; i < count; i++) {
          final a = _r(i, 1) * 2 * math.pi, v = 0.3 + _r(i, 2) * 0.7;
          final x = at.dx + math.cos(a) * v * size.width * 0.55 * easeOut(p) + math.sin(p * 12 + i) * 10;
          final y = at.dy + math.sin(a) * v * size.height * 0.3 * easeOut(p) + p * p * size.height * 0.6;
          canvas.save();
          canvas.translate(x, y);
          canvas.rotate(p * 14 * (_r(i, 3) - 0.5));
          final paint = Paint()..color = colors[i % colors.length].withValues(alpha: p > 0.8 ? (1 - p) / 0.2 : 1);
          canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: 9, height: 5 + _r(i, 4) * 6), paint);
          canvas.restore();
        }
      });

/// Lluvia azul en diagonal (tristeza).
Widget rain(double s, double strength) => strength <= 0
    ? const SizedBox.shrink()
    : painted((canvas, size) {
        final paint = Paint()
          ..color = const Color(0xFF9CC8FF).withValues(alpha: 0.55 * strength)
          ..strokeWidth = 2
          ..strokeCap = StrokeCap.round;
        for (var i = 0; i < 60; i++) {
          final x = _r(i, 5) * (size.width + 80) - 40, speed = 0.9 + _r(i, 6) * 0.6;
          final y = ((_r(i, 7) + s * speed) % 1) * (size.height + 60) - 30;
          canvas.drawLine(Offset(x, y), Offset(x - 6, y + 22), paint);
        }
      });

/// Líneas de velocidad que salen del centro (susto, golpe).
Widget speedLines(Offset at, double p, Color color) => p <= 0 || p >= 1
    ? const SizedBox.shrink()
    : painted((canvas, size) {
        final paint = Paint()
          ..color = color.withValues(alpha: 0.8 * (1 - p))
          ..strokeWidth = 4
          ..strokeCap = StrokeCap.round;
        final far = math.max(size.width, size.height) * 0.7;
        for (var i = 0; i < 28; i++) {
          final a = i * 2 * math.pi / 28 + _r(i, 8) * 0.2, near = 90 + (far - 90) * easeOut(p) * (0.5 + _r(i, 9) * 0.5);
          canvas.drawLine(at + Offset(math.cos(a), math.sin(a)) * near,
              at + Offset(math.cos(a), math.sin(a)) * (near + 40 + 60 * _r(i, 10)), paint);
        }
      });

/// Chispas y esquirlas que vuelan desde [at] con gravedad.
Widget debris(Offset at, double p, {Color color = const Color(0xFFFFB347), int count = 26, double reach = 1}) =>
    p <= 0 || p >= 1
        ? const SizedBox.shrink()
        : painted((canvas, size) {
            for (var i = 0; i < count; i++) {
              final a = _r(i, 11) * 2 * math.pi, v = (0.4 + _r(i, 12) * 0.6) * reach * size.shortestSide * 0.55;
              final pos = at + Offset(math.cos(a) * v * easeOut(p), math.sin(a) * v * easeOut(p) + p * p * 160);
              final paint = Paint()
                ..color = Color.lerp(const Color(0xFFFFF1B8), color, p)!.withValues(alpha: 1 - p)
                ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 1.5);
              canvas.drawCircle(pos, 3.5 * (1 - p) + 1.5, paint);
            }
          });

/// Rayas horizontales de viento o de movimiento.
Widget wind(double s, double strength, {Color color = const Color(0xFFFFFFFF)}) => strength <= 0
    ? const SizedBox.shrink()
    : painted((canvas, size) {
        final paint = Paint()
          ..color = color.withValues(alpha: 0.35 * strength)
          ..strokeWidth = 3
          ..strokeCap = StrokeCap.round;
        for (var i = 0; i < 16; i++) {
          final y = _r(i, 13) * size.height, len = 60 + _r(i, 14) * 120;
          final x = ((_r(i, 15) + s * (0.5 + _r(i, 16))) % 1) * (size.width + len * 2) - len;
          canvas.drawLine(Offset(x, y), Offset(x + len, y), paint);
        }
      });

/// Bala trazadora de [from] a [to] (p de 0 a 1 mientras vuela).
Widget tracer(Offset from, Offset to, double p, {Color color = const Color(0xFFFFE08A)}) => p <= 0 || p >= 1
    ? const SizedBox.shrink()
    : painted((canvas, size) {
        final head = Offset.lerp(from, to, p)!, tail = Offset.lerp(from, to, math.max(0, p - 0.35))!;
        canvas.drawLine(
            tail,
            head,
            Paint()
              ..shader =
                  LinearGradient(colors: [color.withValues(alpha: 0), color]).createShader(Rect.fromPoints(tail, head))
              ..strokeWidth = 5
              ..strokeCap = StrokeCap.round);
      });
