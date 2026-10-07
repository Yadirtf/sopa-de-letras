import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/game_board_provider.dart';

/// Guia encima de la sopa: muestra letra a letra la palabra que el jugador va
/// trazando. Se pone verde mientras el trazo va camino de una palabra que aun le
/// falta (en cualquier sentido), asi sabe si seguir deslizando o soltar.
/// Tiene alto fijo para que el tablero no salte al empezar o terminar un trazo.
class FormingWordBar extends ConsumerWidget {
  final List<String> pendingWords;

  const FormingWordBar({super.key, required this.pendingWords});

  /// En camino: alguna palabra pendiente empieza asi (o termina asi, si se traza al reves).
  static bool isOnTrack(String formed, List<String> pending) {
    if (formed.isEmpty) return false;
    final reversed = formed.split('').reversed.join();
    return pending.any((w) {
      final word = w.toUpperCase();
      return word.startsWith(formed) || word.endsWith(reversed);
    });
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formed = ref.watch(gameBoardProvider.select((s) => s.isActive ? s.formedWord : '')).toUpperCase();
    final onTrack = isOnTrack(formed, pendingWords);
    final complete = pendingWords.any((w) {
      final word = w.toUpperCase();
      return word == formed || word == formed.split('').reversed.join();
    });
    final color = complete ? AppColors.accentEmerald : (onTrack ? AppColors.accentCyan : AppColors.accentAmber);

    return SizedBox(
      key: const ValueKey('forming-word-bar'),
      height: 44,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 180),
        child: formed.isEmpty
            ? Center(
                key: const ValueKey('forming-empty'),
                child: Text(
                  'Aquí verás la palabra que vas formando',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                ),
              )
            : FittedBox(
                key: const ValueKey('forming-word'),
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (var i = 0; i < formed.length; i++)
                      _LetterTile(key: ValueKey('t$i'), letter: formed[i], color: color),
                    if (complete)
                      const Padding(
                        padding: EdgeInsets.only(left: 6),
                        child: Icon(Icons.check_circle_rounded, color: AppColors.accentEmerald, size: 26),
                      ),
                  ],
                ),
              ),
      ),
    );
  }
}

class _LetterTile extends StatelessWidget {
  final String letter;
  final Color color;

  const _LetterTile({super.key, required this.letter, required this.color});

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.4, end: 1),
      duration: const Duration(milliseconds: 160),
      curve: Curves.easeOutBack,
      builder: (_, scale, child) => Transform.scale(scale: scale, child: child),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: 34,
        height: 40,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color, width: 1.5),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.35), blurRadius: 8)],
        ),
        child: Text(letter, style: AppTypography.heading2.copyWith(fontSize: 20, color: AppColors.textPrimary)),
      ),
    );
  }
}
