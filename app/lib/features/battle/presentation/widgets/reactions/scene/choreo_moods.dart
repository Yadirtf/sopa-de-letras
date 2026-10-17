import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import 'choreo.dart';
import 'choreo_faces.dart';
import 'fx_layers.dart';
import 'fx_particles.dart';

/// "¡Grrr!": se acerca de golpe, gruñe temblando, se pone rojo y echa vapor.
class AngryChoreo extends Choreo {
  const AngryChoreo();
  static const _steam = 1.5;
  static const _red = Color(0xFFFF3B1F);

  @override
  double shake(double s) => s >= 0.1 && s < _steam ? 3.5 : 0;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, on = seg(s, 0.05, 0.3) * (1 - seg(s, 3.0, 3.4));
    final boil = seg(s, 0.1, _steam);
    final side = c.actorSize * 0.5;
    return [
      vignette(_red, on * (0.5 + 0.3 * math.sin(s * 9).abs())),
      glow(c.center, c.actorSize * 0.9, _red, on * 0.6),
      c.actor(c.center, scale: 2.0 - easeOut(seg(s, 0, 0.25)) * 0.9 + boil * 0.12),
      floatingWord('GRRR', c.center.translate(0, -c.actorSize * 0.75), seg(s, 0.15, 1.5), _red, size: 40),
      for (var k = 0; k < 7; k++)
        fx('puff', seg(s, _steam + k * 0.2, _steam + k * 0.2 + 0.9),
            c.center.translate((k.isEven ? -1 : 1) * side, -c.actorSize * 0.25), 120,
            rise: 130),
    ];
  }
}

/// "Ay, no…": baja despacio bajo la lluvia, se hunde con cada "uaa" del trombón.
class SadChoreo extends Choreo {
  const SadChoreo();
  static const _notes = [0.1, 0.6, 1.1, 1.6];

  @override
  double get captionAt => 0.7;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, on = seg(s, 0, 0.8) * (1 - seg(s, 3.0, 3.5));
    final sink = _notes.fold(0.0, (m, n) => m + seg(s, n, n + 0.3) * 12);
    final at = Offset.lerp(c.center.translate(0, -c.size.height * 0.5), c.center, easeOut(seg(s, 0, 0.9)))!;
    return [
      flash(const Color(0xFF0B1E3B), 0.45 * on),
      rain(s, on),
      c.actor(at.translate(0, sink - 24), angle: s > 1.6 ? math.sin(s * 12) * 0.04 * (1 - seg(s, 1.6, 3.2)) : 0),
    ];
  }
}

/// "Pan comido": entra deslizándose con gafas oscuras, brillan, retumba el bajo y cabecea.
class CoolChoreo extends Choreo {
  const CoolChoreo();
  static const _drop = 0.9;
  static const _snaps = [0.9, 1.5, 2.1];
  static const _blue = Color(0xFF818CF8);

  @override
  double shake(double s) => s >= _drop && s < _drop + 0.2 ? 5 : 0;

  @override
  List<Widget> layers(ChoreoCtx c) {
    final s = c.s, slide = seg(s, 0, 0.55);
    final start = c.center.translate(c.size.width * (c.fromMe ? -0.8 : 0.8), 0);
    final nod = _snaps.fold(0.0, (m, t) => math.max(m, hop(s, t, 0.25)));
    final glint = c.center.translate(-c.actorSize * 0.14, -c.actorSize * 0.02);
    return [
      rays(c.center, s, _blue, seg(s, _drop, _drop + 0.4) * (1 - seg(s, 3.1, 3.5)), count: 10, speed: 0.6),
      wind(s * 3, 1 - slide, color: _blue),
      for (final t in _snaps) ring(c.center, seg(s, t, t + 0.6), c.actorSize * 1.3, _blue, width: 8),
      c.actor(Offset.lerp(start, c.center, backOut(slide))!.translate(0, nod * 12), angle: (1 - slide) * -0.2),
      fx('flash', seg(s, 0.6, 0.95), glint, 110),
    ];
  }
}
