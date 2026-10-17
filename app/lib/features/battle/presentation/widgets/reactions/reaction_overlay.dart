import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../providers/battle_match_notifier.dart';
import '../../sound/battle_sounds.dart';
import 'reaction_caption.dart';
import 'reaction_sprite.dart';
import 'scene/choreo.dart';

/// Escena a pantalla completa de cada reacción (la mía y la del rival), con
/// su propio sonido, encima de cualquier pantalla de la batalla. No bloquea
/// los toques: se puede seguir jugando mientras dura.
class ReactionOverlay extends ConsumerStatefulWidget {
  final String code;
  final BattleCatalog catalog;
  final Widget child;

  const ReactionOverlay({super.key, required this.code, required this.catalog, required this.child});

  @override
  ConsumerState<ReactionOverlay> createState() => _ReactionOverlayState();
}

class _ReactionOverlayState extends ConsumerState<ReactionOverlay> with SingleTickerProviderStateMixin {
  late final _anim = AnimationController(vsync: this, duration: choreoDuration);
  BattleReactionShow? _show;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), _warmUp);
  }

  /// Trae de antemano las tiras y los sonidos para que la primera reacción
  /// no llegue con retraso (en la web quedan en la caché del navegador).
  Future<void> _warmUp() async {
    for (final r in widget.catalog.reactions) {
      if (!mounted) return;
      for (final asset in [ReactionSheet.asset(r.id), 'assets/battle/sounds/reactions/${r.id}.mp3']) {
        try {
          await rootBundle.load(asset);
        } catch (_) {}
      }
    }
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  Future<void> _onReaction(BattleReactionShow? show) async {
    if (show == null) return;
    // La escena y su sonido arrancan juntos cuando el dibujo ya está listo.
    try {
      await ref.read(reactionSheetProvider(show.reactionId).future).timeout(const Duration(milliseconds: 1500));
    } catch (_) {}
    if (!mounted) return;
    setState(() => _show = show);
    _anim.forward(from: 0);
    ref.read(battleSoundsProvider.notifier).playReaction(show.reactionId, quiet: show.fromMe);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(battleMatchProvider(widget.code).select((s) => s.reaction), (_, next) => _onReaction(next));
    final enemy = ref.watch(battleMatchProvider(widget.code).select((s) => s.view?.enemy?.username)) ?? 'Tu rival';
    return AnimatedBuilder(
      animation: _anim,
      child: widget.child,
      builder: (context, child) {
        final show = _show;
        // El juego siempre va en el mismo sitio del árbol para no perder su estado.
        if (show == null || !_anim.isAnimating) {
          return Stack(children: [Transform.translate(offset: Offset.zero, child: child), const SizedBox.shrink()]);
        }
        final s = _anim.value * choreoSeconds;
        final choreo = Choreo.of(show.reactionId);
        final px = choreo.shake(s);
        final shake = Offset(math.sin(s * 91) * px, math.cos(s * 73) * px);
        final label = widget.catalog.reaction(show.reactionId).label;
        return Stack(children: [
          Transform.translate(offset: shake, child: child),
          Positioned.fill(
            child: IgnorePointer(
              child: LayoutBuilder(builder: (context, box) {
                final ctx = ChoreoCtx(
                  s: s,
                  size: box.biggest,
                  reactionId: show.reactionId,
                  fromMe: show.fromMe,
                  actorSize: math.min(box.biggest.shortestSide * (show.fromMe ? 0.42 : 0.55), show.fromMe ? 190 : 250),
                );
                return Opacity(
                  opacity: 1 - seg(s, 3.15, choreoSeconds),
                  child: Transform.translate(
                    offset: shake * 0.5,
                    child: Stack(clipBehavior: Clip.none, children: [
                      ...choreo.layers(ctx),
                      ReactionCaption(
                        text: show.fromMe ? 'Tú: $label' : '$enemy: $label',
                        at: ctx.center.translate(0, ctx.actorSize * 0.62),
                        p: seg(s, choreo.captionAt, choreo.captionAt + 0.35),
                      ),
                    ]),
                  ),
                );
              }),
            ),
          ),
        ]);
      },
    );
  }
}
