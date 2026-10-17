import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import 'choreo.dart';
import 'fx_layers.dart';
import 'fx_particles.dart';

const _red = Color(0xFFFF2D2D);
const _white = Color(0xFFFFFFFF);

/// "¡En el blanco!": la diana aparece, la mira se cierra con tres pitidos y ¡pum!, al centro.
class TargetChoreo extends Choreo {
  const TargetChoreo();
  static const _hit = 1.4;

  @override
  double shake(double s) => s >= _hit && s < _hit + 0.25 ? 6 : 0;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, lock = easeOut(seg(s, 0.5, _hit));
    final radius = c.actorSize * (1.7 - lock * 1.2);
    final beep = [0.6, 0.82, 1.04].any((b) => s >= b && s < b + 0.1);
    final wobble = s >= _hit ? math.sin(s * 80) * 6 * (1 - seg(s, _hit, _hit + 0.6)) : 0.0;
    return [
      glow(c.center, c.actorSize * 0.9, _red, s >= _hit ? 1 - seg(s, _hit, _hit + 0.8) : 0),
      c.actor(c.center.translate(wobble, 0), scale: backOut(seg(s, 0, 0.5))),
      if (s >= 0.5 && s < _hit + 0.4)
        painted((canvas, _) {
          final paint = Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = beep || s >= _hit ? 5 : 3
            ..color = (s >= _hit ? _white : _red).withValues(alpha: s >= _hit ? 1 - seg(s, _hit, _hit + 0.4) : 0.9);
          canvas.drawCircle(c.center, radius, paint);
          for (var i = 0; i < 4; i++) {
            final a = i * math.pi / 2 + (1 - lock) * 1.2, d = Offset(math.cos(a), math.sin(a));
            canvas.drawLine(c.center + d * radius * 0.7, c.center + d * radius * 1.25, paint);
          }
        }),
      ring(c.center, seg(s, _hit, _hit + 0.6), c.actorSize * 1.4, _white, width: 10),
      debris(c.center, seg(s, _hit, _hit + 0.8), color: const Color(0xFFFFE08A), count: 14, reach: 0.6),
      flash(_white, 0.35 * (1 - seg(s, _hit, _hit + 0.25)) * (s >= _hit ? 1 : 0)),
    ];
  }
}

/// "¡No me das!": el escudo cae de golpe y rebota tres balas con chispas.
class ShieldChoreo extends Choreo {
  const ShieldChoreo();
  static const _hits = [1.0, 1.6, 2.2];

  @override
  double shake(double s) => (s >= 0.4 && s < 0.55 ? 7 : 0) + (_hits.any((h) => s >= h && s < h + 0.1) ? 3 : 0);

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, w = c.size.width;
    final start = c.center.translate(0, c.from * -c.size.height * 0.7);
    final recoil = _hits.fold(0.0, (m, h) => math.max(m, s >= h ? 1 - seg(s, h, h + 0.22) : 0));
    return [
      glow(c.center, c.actorSize * 0.85, const Color(0xFF38BDF8), 0.35 + recoil * 0.6),
      c.actor(Offset.lerp(start, c.center, backOut(seg(s, 0, 0.45)))!, scale: 1 - recoil * 0.08, angle: recoil * 0.06),
      for (var i = 0; i < _hits.length; i++)
        ...() {
          final h = _hits[i], side = i.isEven ? -1.0 : 1.0;
          final from = Offset(w / 2 + side * w * 0.65, c.center.dy - 80 + i * 40);
          final away = c.center + Offset(side * w * 0.4, -c.size.height * 0.35);
          final spark = c.center.translate(side * c.actorSize * 0.12, -10 + i * 14);
          return [
            tracer(from, spark, seg(s, h - 0.12, h)),
            tracer(spark, away, seg(s, h, h + 0.25)),
            fx('flash', seg(s, h, h + 0.3), spark, 150),
            ring(c.center, seg(s, h, h + 0.5), c.actorSize * 0.95, const Color(0xFF7DD3FC), width: 8),
            debris(spark, seg(s, h, h + 0.5), color: const Color(0xFFFFE08A), count: 10, reach: 0.35),
          ];
        }(),
    ];
  }
}

/// "¡Alerta!": la sirena cae, gira su luz y la pantalla late en rojo.
class SirenChoreo extends Choreo {
  const SirenChoreo();

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, on = seg(s, 0.15, 0.4) * (1 - seg(s, 3.0, 3.4));
    final pulse = math.sin(math.pi * s / 0.75).abs();
    final drop = c.center.translate(0, -c.size.height * 0.6 * (1 - elastic(seg(s, 0, 0.7))));
    return [
      vignette(_red, on * (0.45 + 0.55 * pulse)),
      flash(_red, on * 0.12 * pulse),
      if (on > 0)
        painted((canvas, size) {
          final len = c.maxSide;
          final paint = Paint()
            ..shader = RadialGradient(colors: [_red.withValues(alpha: 0.5 * on), _red.withValues(alpha: 0)])
                .createShader(Rect.fromCircle(center: drop, radius: len * 0.7));
          for (final base in [0.0, math.pi]) {
            final a = base + s * 4;
            canvas.drawPath(
                Path()
                  ..moveTo(drop.dx, drop.dy)
                  ..lineTo(drop.dx + math.cos(a - 0.25) * len, drop.dy + math.sin(a - 0.25) * len)
                  ..lineTo(drop.dx + math.cos(a + 0.25) * len, drop.dy + math.sin(a + 0.25) * len)
                  ..close(),
                paint);
          }
        }),
      c.actor(drop, scale: 1.05 + 0.08 * pulse * on),
    ];
  }
}
