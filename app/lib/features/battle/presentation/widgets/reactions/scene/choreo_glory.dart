import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import 'choreo.dart';
import 'fx_layers.dart';
import 'fx_particles.dart';

const _gold = Color(0xFFFFC83D);
const _party = [Color(0xFFFFC83D), Color(0xFFF43F5E), Color(0xFF38BDF8), Color(0xFF10B981), Color(0xFFA78BFA)];

/// "¡Voy ganando!": el trofeo sube entre rayos dorados y estalla el confeti con la fanfarria.
class TrophyChoreo extends Choreo {
  const TrophyChoreo();
  static const _top = 0.8;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, rise = easeOut(seg(s, 0, _top));
    final at = Offset.lerp(c.center.translate(0, c.size.height * 0.65), c.center, rise)!;
    final pop = s < _top ? 0.0 : 1 - elastic(seg(s, _top, _top + 0.8));
    return [
      rays(c.center, s, _gold, seg(s, 0.5, 1.0) * (1 - seg(s, 3.1, 3.5)), count: 14),
      glow(c.center, c.actorSize * 0.9, _gold, seg(s, 0.4, 1.0) * 0.8),
      ring(c.center, seg(s, _top, _top + 0.7), c.actorSize * 1.6, _gold),
      c.actor(at, scale: 0.65 + 0.35 * rise + pop * 0.25),
      confetti(c.center, seg(s, _top, 3.5), _party),
      debris(c.center, seg(s, _top, _top + 1.2), color: _gold, count: 18, reach: 0.7),
    ];
  }
}

/// "¡Bien jugado!": la medalla baja colgando, se mece y brilla mientras suenan aplausos.
class MedalChoreo extends Choreo {
  const MedalChoreo();

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, drop = easeOut(seg(s, 0, 0.6));
    final pivot = c.center.translate(0, -c.size.height * 0.45);
    final len = (c.center.dy - pivot.dy) * drop;
    final swing = 0.55 * math.cos(s * 5.5) * math.exp(-s * 1.2);
    final at = pivot + Offset(math.sin(swing), math.cos(swing)) * len;
    return [
      rays(c.center, -s, _gold, seg(s, 0.6, 1.1) * (1 - seg(s, 3.1, 3.5)) * 0.8, count: 10, speed: 0.25),
      glow(c.center, c.actorSize * 0.85, _gold, seg(s, 0.5, 1.0) * 0.7),
      painted((canvas, _) => canvas.drawLine(
          pivot,
          at.translate(0, -c.actorSize * 0.3),
          Paint()
            ..color = const Color(0xFFB45309)
            ..strokeWidth = 3)),
      c.actor(at, angle: -swing),
      for (final (i, t) in [0.7, 1.2, 1.7, 2.2].indexed)
        debris(c.center.translate(i.isEven ? -40 : 40, -30), seg(s, t, t + 0.8), color: _gold, count: 8, reach: 0.4),
      confetti(c.center.translate(0, -c.size.height * 0.3), seg(s, 1.1, 3.5),
          const [Color(0xFF1D4ED8), Color(0xFFDC2626), _gold],
          count: 40),
    ];
  }
}

/// "¡Me rindo!": la bandera blanca sube despacio, el viento sopla y todo se pone gris.
class FlagChoreo extends Choreo {
  const FlagChoreo();

  @override
  double get captionAt => 0.9;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, on = seg(s, 0, 0.8) * (1 - seg(s, 3.0, 3.5));
    final at = Offset.lerp(c.center.translate(0, c.size.height * 0.6), c.center, easeOut(seg(s, 0, 1.4)))!;
    return [
      flash(const Color(0xFF111827), 0.5 * on),
      wind(s, on),
      c.actor(at.translate(math.sin(s * 2.2) * 8, 0), scale: 1.1, angle: math.sin(s * 2.2) * 0.05),
    ];
  }
}
