import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../providers/battle_match_notifier.dart';
import '../../sound/battle_sounds.dart';
import 'reaction_sprite.dart';

/// Muestra en grande la reacción que llega del rival (y en pequeño la que mando yo),
/// con su sonido, encima de cualquier pantalla de la batalla.
class ReactionOverlay extends ConsumerStatefulWidget {
  final String code;
  final BattleCatalog catalog;
  final Widget child;

  const ReactionOverlay({super.key, required this.code, required this.catalog, required this.child});

  @override
  ConsumerState<ReactionOverlay> createState() => _ReactionOverlayState();
}

class _ReactionOverlayState extends ConsumerState<ReactionOverlay> with SingleTickerProviderStateMixin {
  late final _anim = AnimationController(vsync: this, duration: const Duration(milliseconds: 2800));
  BattleReactionShow? _show;

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  void _onReaction(BattleReactionShow? show) {
    if (show == null) return;
    setState(() => _show = show);
    _anim.forward(from: 0);
    ref.read(battleSoundsProvider.notifier).play(show.fromMe ? BattleSound.reactionOut : BattleSound.reactionIn);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(battleMatchProvider(widget.code).select((s) => s.reaction), (_, next) => _onReaction(next));
    final enemy = ref.watch(battleMatchProvider(widget.code).select((s) => s.view?.enemy?.username)) ?? 'Tu rival';
    return Stack(children: [
      widget.child,
      Positioned.fill(
        child: IgnorePointer(
          child: AnimatedBuilder(
            animation: _anim,
            builder: (_, __) {
              final show = _show;
              if (show == null || !_anim.isAnimating) return const SizedBox.shrink();
              final t = _anim.value;
              final pop = Curves.elasticOut.transform((t / 0.3).clamp(0.0, 1.0));
              final fade = 1 - ((t - 0.8) / 0.2).clamp(0.0, 1.0);
              final label = widget.catalog.reaction(show.reactionId).label;
              final card = _Card(
                reactionId: show.reactionId,
                text: show.fromMe ? 'Tú: $label' : '$enemy: $label',
                size: show.fromMe ? 92 : 160,
              );
              return Align(
                alignment: show.fromMe ? const Alignment(0.92, -0.92) : const Alignment(0, -0.45),
                child: Opacity(
                  opacity: fade,
                  child: Transform.translate(
                    offset: Offset(0, show.fromMe ? -40 * t : 0),
                    child: Transform.scale(scale: 0.3 + 0.7 * pop, child: card),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    ]);
  }
}

class _Card extends StatelessWidget {
  final String reactionId;
  final String text;
  final double size;
  const _Card({required this.reactionId, required this.text, required this.size});

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      ReactionSprite(key: ValueKey('reaction-show-$reactionId'), reactionId: reactionId, size: size),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.bgCard.withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.accentAmber.withValues(alpha: 0.7)),
        ),
        child: Text(text, style: AppTypography.labelBold.copyWith(fontSize: size > 100 ? 17 : 13)),
      ),
    ]);
  }
}
