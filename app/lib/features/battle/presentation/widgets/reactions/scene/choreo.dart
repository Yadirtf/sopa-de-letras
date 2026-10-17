import 'dart:math' as math;
import 'package:flutter/widgets.dart';
import '../reaction_sprite.dart';
import 'choreo_blast.dart';
import 'choreo_faces.dart';
import 'choreo_gear.dart';
import 'choreo_glory.dart';
import 'choreo_moods.dart';

/// Duración de cada escena; los sonidos de assets/battle/sounds/reactions
/// están cortados a la misma medida (app/tool/battle_art/audio/reactions.py).
const choreoDuration = Duration(milliseconds: 3600);
const choreoSeconds = 3.6;

/// Avance de 0 a 1 entre los segundos [a] y [b] de la escena.
double seg(double s, double a, double b) => ((s - a) / (b - a)).clamp(0.0, 1.0);

double easeOut(double x) => Curves.easeOutCubic.transform(x);
double elastic(double x) => Curves.elasticOut.transform(x);
double backOut(double x) => Curves.easeOutBack.transform(x);

/// Lo que cada escena necesita para dibujarse en el segundo [s].
class ChoreoCtx {
  final double s;
  final Size size;
  final String reactionId;
  final bool fromMe;
  final double actorSize;

  const ChoreoCtx({
    required this.s,
    required this.size,
    required this.reactionId,
    required this.fromMe,
    required this.actorSize,
  });

  /// Centro del escenario, algo arriba de la mitad para no tapar el tablero propio.
  Offset get center => Offset(size.width / 2, size.height * 0.42);

  /// Las cosas del rival entran por arriba; las mías salen desde abajo.
  double get from => fromMe ? 1 : -1;

  double get maxSide => math.max(size.width, size.height);

  /// La reacción 3D animada, centrada en [at].
  Widget actor(Offset at, {double scale = 1, double angle = 0, double opacity = 1, double? sx, double? sy}) {
    if (opacity <= 0 || scale <= 0) return const SizedBox.shrink();
    return place(
      at,
      actorSize,
      Opacity(
        opacity: opacity.clamp(0.0, 1.0),
        child: Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..rotateZ(angle)
            ..scaleByDouble((sx ?? 1) * scale, (sy ?? 1) * scale, 1, 1),
          child: ReactionSprite(key: ValueKey('reaction-show-$reactionId'), reactionId: reactionId, size: actorSize),
        ),
      ),
    );
  }
}

/// Coloca [child] de [side] px centrado en [at].
Widget place(Offset at, double side, Widget child) =>
    Positioned(left: at.dx - side / 2, top: at.dy - side / 2, width: side, height: side, child: child);

/// Una escena: capas que se dibujan sobre el juego y cuánto tiembla la pantalla.
abstract class Choreo {
  const Choreo();

  /// Píxeles de sacudida en el segundo [s].
  double shake(double s) => 0;

  /// Segundo en que aparece el texto de la reacción.
  double get captionAt => 0.4;

  List<Widget> layers(ChoreoCtx c);

  static Choreo of(String id) => switch (id) {
        'boom' => const BombChoreo(),
        'incoming' => const MissileChoreo(),
        'bullseye' => const TargetChoreo(),
        'blocked' => const ShieldChoreo(),
        'alert' => const SirenChoreo(),
        'winning' => const TrophyChoreo(),
        'well_played' => const MedalChoreo(),
        'surrender' => const FlagChoreo(),
        'laugh' => const LaughChoreo(),
        'sly' => const SlyChoreo(),
        'angry' => const AngryChoreo(),
        'sad' => const SadChoreo(),
        'shocked' => const ShockedChoreo(),
        'cool' => const CoolChoreo(),
        _ => const PopChoreo(),
      };
}

/// Para reacciones nuevas que esta versión de la app aún no conoce.
class PopChoreo extends Choreo {
  const PopChoreo();

  @override
  List<Widget> layers(ChoreoCtx c) => [c.actor(c.center, scale: elastic(seg(c.s, 0, 0.6)))];
}
