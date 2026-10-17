import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import 'choreo.dart';
import 'fx_layers.dart';
import 'fx_particles.dart';

/// Salto corto que dura [d] segundos a partir de [t].
double hop(double s, double t, [double d = 0.18]) => math.sin(math.pi * seg(s, t, t + d));

/// "¡Jajaja!": la cara rebota con cada carcajada y los JA salen volando.
class LaughChoreo extends Choreo {
  const LaughChoreo();
  static final _ha = [for (var k = 0; k < 7; k++) 0.15 + k * 0.21, for (var k = 0; k < 5; k++) 1.7 + k * 0.22];

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, bounce = _ha.fold(0.0, (m, t) => math.max(m, hop(s, t)));
    return [
      glow(c.center, c.actorSize * 0.8, const Color(0xFFFFD43B), 0.5 * seg(s, 0, 0.4)),
      c.actor(c.center.translate(0, -18 * bounce),
          scale: elastic(seg(s, 0, 0.6)), angle: math.sin(s * 7) * 0.12, sx: 1 + bounce * 0.06, sy: 1 - bounce * 0.05),
      for (final (i, t) in _ha.indexed)
        floatingWord(
          'JA',
          c.center
              .translate((i.isEven ? -1 : 1) * c.actorSize * (0.55 + (i % 3) * 0.1), -c.actorSize * 0.2 + (i % 4) * 14),
          seg(s, t, t + 0.9),
          const Color(0xFFFFD43B),
          size: 30 + (i % 3) * 6,
          angle: (i.isEven ? -1 : 1) * 0.25,
        ),
    ];
  }
}

/// "Je, je, je": entra de puntillas, se ríe por lo bajo y le brilla la mirada.
class SlyChoreo extends Choreo {
  const SlyChoreo();
  static final _je = [for (var k = 0; k < 4; k++) 0.2 + k * 0.19, for (var k = 0; k < 3; k++) 1.3 + k * 0.19];
  static const _purple = Color(0xFFC084FC);

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, walk = seg(s, 0, 0.8);
    final x = c.size.width * (c.fromMe ? 1.25 : -0.25);
    final at = Offset.lerp(Offset(x, c.center.dy), c.center, easeOut(walk))!;
    final tiptoe = walk < 1 ? math.sin(s * 22).abs() * 12 : 0.0;
    final giggle = _je.fold(0.0, (m, t) => math.max(m, hop(s, t, 0.14)));
    final eye = c.center.translate(c.actorSize * 0.14, -c.actorSize * 0.06);
    return [
      glow(c.center, c.actorSize * 0.8, _purple, 0.45 * seg(s, 0.4, 0.9)),
      c.actor(at.translate(0, -tiptoe - giggle * 8), angle: math.sin(s * 9) * 0.06 * (1 + giggle)),
      for (final (i, t) in _je.indexed)
        floatingWord('je', c.center.translate((i.isEven ? 1 : -1) * c.actorSize * 0.55, -c.actorSize * 0.1),
            seg(s, t, t + 0.8), _purple,
            size: 26, angle: i.isEven ? 0.2 : -0.2),
      fx('flash', seg(s, 1.6, 1.95), eye, 100),
    ];
  }
}

/// "¡¿Qué?!": aparece de golpe con líneas de susto y pega un brinco.
class ShockedChoreo extends Choreo {
  const ShockedChoreo();

  @override
  double shake(double s) => s < 0.15 ? 9 : 0;

  @override
  double get captionAt => 0.2;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, jump = hop(s, 0.6, 0.4);
    return [
      flash(const Color(0xFFFFFFFF), 0.55 * (1 - seg(s, 0, 0.25))),
      speedLines(c.center, seg(s, 0, 0.9), const Color(0xFFFFFFFF)),
      speedLines(c.center, seg(s, 0.6, 1.4), const Color(0xFFFFE08A)),
      c.actor(c.center.translate(0, -50 * jump), scale: elastic(seg(s, 0, 0.7)) * 1.12, sy: 1 + jump * 0.1),
      floatingWord(
          '!', c.center.translate(-c.actorSize * 0.6, -c.actorSize * 0.3), seg(s, 0.05, 1.1), const Color(0xFFFF5A5A),
          size: 56, angle: -0.3),
      floatingWord(
          '?', c.center.translate(c.actorSize * 0.6, -c.actorSize * 0.35), seg(s, 0.15, 1.2), const Color(0xFF7DD3FC),
          size: 56, angle: 0.3),
    ];
  }
}
