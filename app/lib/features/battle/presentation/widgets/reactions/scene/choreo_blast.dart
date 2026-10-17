import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import 'choreo.dart';
import 'fx_layers.dart';
import 'fx_particles.dart';

const _fire = Color(0xFFFF8A1F);
const _yellow = Color(0xFFFFD43B);

/// Estallido completo en el segundo [e]: destello, bola de fuego, onda,
/// esquirlas, humo que sube y la palabra "¡BUM!".
List<Widget> explosion(ChoreoCtx c, double e, Offset at, {double power = 1}) {
  final s = c.s, big = c.maxSide * 0.55 * power;
  if (s < e) return const [];
  return [
    flash(const Color(0xFFFFF4D6), 0.9 * power * (1 - seg(s, e, e + 0.35))),
    glow(at, big * 0.6, _fire, 1 - seg(s, e, e + 0.7)),
    fx('smoke', seg(s, e + 0.3, e + 2.0), at.translate(-big * 0.12, 10), big * 0.7, rise: 110),
    fx('smoke', seg(s, e + 0.25, e + 1.9), at, big * 0.95, rise: 80),
    fx('flash', seg(s, e, e + 0.45), at, big * 0.95),
    fx('fire', seg(s, e + 0.02, e + 0.95), at, big * 0.85, spin: 0.4),
    fx('fire', seg(s, e + 0.12, e + 1.05), at.translate(big * 0.14, -big * 0.06), big * 0.5, spin: -0.6),
    ring(at, seg(s, e, e + 0.7), big * 0.95, const Color(0xFFFFFFFF)),
    debris(at, seg(s, e, e + 1.2), reach: power),
    floatingWord('¡BUM!', at.translate(0, -big * 0.3), seg(s, e + 0.05, e + 1.4), _yellow,
        size: 50 * power, angle: -0.12),
  ];
}

double blastShake(double s, double e, double px) => s < e ? 0 : px * (1 - seg(s, e, e + 0.9));

/// "¡Boom!": la bomba vuela en arco, cae, tiembla con la mecha y estalla.
class BombChoreo extends Choreo {
  const BombChoreo();
  static const _land = 1.0, _blast = 1.6;

  @override
  double shake(double s) => (s >= _land && s < _land + 0.15 ? 4 : 0) + blastShake(s, _blast, 18);

  @override
  double get captionAt => _blast + 0.2;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, q = seg(s, 0, _land), h = c.size.height;
    final start = Offset(c.size.width * 0.12, c.fromMe ? h * 1.05 : -h * 0.08);
    Offset path(double q) => Offset.lerp(start, c.center, q)!.translate(0, -math.sin(math.pi * q) * h * 0.22);
    final squash = math.sin(math.pi * seg(s, _land, _land + 0.18));
    final fuse = seg(s, _land, _blast);
    return [
      if (s < _land)
        for (var k = 4; k >= 1; k--)
          if (q - k * 0.07 > 0) fx('puff', 0.25 + k * 0.12, path(q - k * 0.07), 60.0 + k * 10),
      if (s < _blast) glow(c.center, c.actorSize * 0.7, const Color(0xFFFF3B1F), fuse * (0.5 + 0.5 * math.sin(s * 35))),
      if (s < _blast)
        c.actor(
          path(q),
          scale: 0.55 + 0.45 * q + fuse * 0.18,
          angle: s < _land ? q * 4 * math.pi : math.sin(s * 60) * 0.14 * fuse,
          sx: 1 + squash * 0.18,
          sy: 1 - squash * 0.22,
        ),
      ...explosion(c, _blast, c.center),
    ];
  }
}

/// "¡Ahí va!": el misil cruza la pantalla acelerando y revienta en el centro.
class MissileChoreo extends Choreo {
  const MissileChoreo();
  static const _hit = 1.3;

  @override
  double shake(double s) => blastShake(s, _hit, 13);

  @override
  double get captionAt => _hit + 0.15;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, h = c.size.height;
    final start = Offset(c.size.width * 1.1, c.fromMe ? h * 1.1 : -h * 0.12);
    final q = Curves.easeInQuad.transform(seg(s, 0, _hit));
    final dir = c.center - start;
    // En el dibujo 3D la punta del misil mira arriba a la derecha (unos -0,63 rad).
    final angle = math.atan2(dir.dy, dir.dx) + 0.63;
    Offset at(double q) => Offset.lerp(start, c.center, q)!;
    return [
      if (s < _hit) wind(s, seg(s, 0.3, 1.0)),
      if (s < _hit)
        for (var k = 6; k >= 1; k--)
          if (q - k * 0.045 > 0) fx('puff', 0.2 + k * 0.1, at(q - k * 0.045), 46.0 + k * 9),
      if (s < _hit) c.actor(at(q), scale: 0.6 + 0.5 * q, angle: angle),
      ...explosion(c, _hit, c.center, power: 0.85),
    ];
  }
}
