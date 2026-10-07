import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';

/// Haces de luz dorada que giran despacio detras del campeon.
class WinnerRaysPainter extends CustomPainter {
  final double t; // 0..1, vuelta completa
  final Offset focus; // centro relativo (0..1)

  const WinnerRaysPainter({required this.t, this.focus = const Offset(0.5, 0.3)});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width * focus.dx, size.height * focus.dy);
    final radius = size.longestSide;
    const rays = 14;
    final paint = Paint()
      ..shader = RadialGradient(
        colors: [AppColors.accentAmber.withValues(alpha: 0.22), AppColors.accentAmber.withValues(alpha: 0)],
      ).createShader(Rect.fromCircle(center: center, radius: radius * 0.6));
    for (var i = 0; i < rays; i++) {
      final a = (i / rays + t) * 2 * math.pi;
      const spread = math.pi / rays / 2.2;
      final path = Path()
        ..moveTo(center.dx, center.dy)
        ..lineTo(center.dx + radius * math.cos(a - spread), center.dy + radius * math.sin(a - spread))
        ..lineTo(center.dx + radius * math.cos(a + spread), center.dy + radius * math.sin(a + spread))
        ..close();
      canvas.drawPath(path, paint);
    }
    // Halo central
    canvas.drawCircle(
      center,
      radius * 0.28,
      Paint()
        ..shader = RadialGradient(
          colors: [AppColors.accentAmber.withValues(alpha: 0.28), Colors.transparent],
        ).createShader(Rect.fromCircle(center: center, radius: radius * 0.28)),
    );
  }

  @override
  bool shouldRepaint(WinnerRaysPainter old) => old.t != t;
}

/// Confeti que cae en bucle. Las piezas se generan una vez con semilla fija
/// y su posicion sale del tiempo: sin estado y sin trabajo por fotograma.
/// Cada pieza cae un numero entero de veces por vuelta, asi el bucle no se nota.
class ConfettiPainter extends CustomPainter {
  final double t; // 0..1, una vuelta del fondo
  final List<_Piece> _pieces;

  ConfettiPainter({required this.t}) : _pieces = _cache;

  static const _colors = [
    AppColors.accentAmber,
    AppColors.accentCyan,
    AppColors.accentEmerald,
    AppColors.accentRose,
    AppColors.accentViolet,
    Color(0xFFFFE08A),
  ];

  static final List<_Piece> _cache = () {
    final r = math.Random(7);
    return List.generate(70, (i) {
      return _Piece(
        x: r.nextDouble(),
        offset: r.nextDouble(),
        speed: 4 + r.nextInt(5).toDouble(),
        sway: 0.01 + r.nextDouble() * 0.03,
        spin: r.nextDouble() * 6,
        w: 5 + r.nextDouble() * 6,
        color: _colors[i % _colors.length],
      );
    });
  }();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    for (final p in _pieces) {
      final progress = (t * p.speed + p.offset) % 1.0;
      final y = -20 + progress * (size.height + 40);
      final x = (p.x + math.sin((progress + p.offset) * 2 * math.pi) * p.sway) * size.width;
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(progress * p.spin * math.pi);
      // Se "voltea" en el aire: el ancho oscila como un papel girando.
      final flip = math.cos(progress * p.spin * 4).abs().clamp(0.25, 1.0);
      paint.color = p.color.withValues(alpha: 0.85);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset.zero, width: p.w * flip, height: p.w * 0.5), const Radius.circular(1.5)),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(ConfettiPainter old) => old.t != t;
}

class _Piece {
  final double x, offset, speed, sway, spin, w;
  final Color color;

  const _Piece({
    required this.x,
    required this.offset,
    required this.speed,
    required this.sway,
    required this.spin,
    required this.w,
    required this.color,
  });
}
