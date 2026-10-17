import 'package:flutter/widgets.dart';
import '../../../art/battle_art.dart';
import 'choreo.dart';

/// Partículas de Kenney (fuego, destello, humo, polvo) que crecen y se apagan
/// mientras [p] va de 0 a 1. Con [p] fuera de rango no dibuja nada.
Widget fx(String kind, double p, Offset at, double size, {double rise = 0, double spin = 0}) {
  if (p <= 0 || p >= 1) return const SizedBox.shrink();
  final frames = BattleArt.fx[kind] ?? 1;
  final frame = (p * frames).floor().clamp(0, frames - 1);
  final fade = p < 0.6 ? 1.0 : 1 - (p - 0.6) / 0.4;
  return place(
    at.translate(0, -rise * p),
    size,
    Opacity(
      opacity: fade.clamp(0.0, 1.0),
      child: Transform.rotate(
        angle: spin * p,
        child: Transform.scale(
          scale: 0.45 + easeOut(p) * 0.75,
          child: Image.asset(BattleArt.fxFrame(kind, frame), gaplessPlayback: true, fit: BoxFit.contain),
        ),
      ),
    ),
  );
}

/// Pantalla entera de un color que se apaga (destello de la explosión, tinte).
Widget flash(Color color, double opacity) => opacity <= 0
    ? const SizedBox.shrink()
    : Positioned.fill(child: ColoredBox(color: color.withValues(alpha: opacity.clamp(0.0, 1.0))));

/// Bordes de la pantalla teñidos (alarma roja, tristeza azul...).
Widget vignette(Color color, double strength) => strength <= 0
    ? const SizedBox.shrink()
    : Positioned.fill(
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              radius: 0.95,
              colors: [color.withValues(alpha: 0), color.withValues(alpha: (0.75 * strength).clamp(0.0, 1.0))],
              stops: const [0.45, 1],
            ),
          ),
        ),
      );

/// Resplandor redondo detrás de la reacción.
Widget glow(Offset at, double radius, Color color, double strength) => strength <= 0
    ? const SizedBox.shrink()
    : place(
        at,
        radius * 2,
        DecoratedBox(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(colors: [
              color.withValues(alpha: (0.85 * strength).clamp(0.0, 1.0)),
              color.withValues(alpha: 0),
            ]),
          ),
        ),
      );

/// Onda expansiva: un anillo que crece desde [at] y se desvanece.
Widget ring(Offset at, double p, double maxRadius, Color color, {double width = 14}) => p <= 0 || p >= 1
    ? const SizedBox.shrink()
    : Positioned.fill(
        child: CustomPaint(painter: _RingPainter(at, easeOut(p) * maxRadius, color, width * (1 - p), 1 - p)));

class _RingPainter extends CustomPainter {
  final Offset at;
  final double radius;
  final Color color;
  final double width;
  final double alpha;
  _RingPainter(this.at, this.radius, this.color, this.width, this.alpha);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = width + 1
      ..color = color.withValues(alpha: alpha.clamp(0.0, 1.0))
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    canvas.drawCircle(at, radius, paint);
  }

  @override
  bool shouldRepaint(_RingPainter old) => true;
}

/// Texto grande con borde que sube y se apaga (JA, JE, ¡PUM!...).
Widget floatingWord(String text, Offset at, double p, Color color, {double size = 34, double angle = 0}) {
  if (p <= 0 || p >= 1) return const SizedBox.shrink();
  final style = TextStyle(fontSize: size, fontWeight: FontWeight.w900, letterSpacing: 1, height: 1);
  return place(
    at.translate(0, -70 * easeOut(p)),
    size * 4,
    Opacity(
      opacity: p < 0.7 ? 1 : (1 - p) / 0.3,
      child: Transform.rotate(
        angle: angle,
        child: Transform.scale(
          scale: backOut((p / 0.25).clamp(0.0, 1.0)),
          child: Center(
            child: Stack(children: [
              Text(text,
                  style: style.copyWith(
                      foreground: Paint()
                        ..style = PaintingStyle.stroke
                        ..strokeWidth = 5
                        ..color = const Color(0xFF1A1206))),
              Text(text, style: style.copyWith(color: color)),
            ]),
          ),
        ),
      ),
    ),
  );
}
