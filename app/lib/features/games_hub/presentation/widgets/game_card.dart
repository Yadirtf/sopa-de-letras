import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/games_provider.dart';

/// Tarjeta grande de un juego: dibujo, nombre, de qué se trata y "¡Nuevo!" si acaba de llegar.
class GameCard extends StatelessWidget {
  final GameInfo game;
  final Color accent;
  final VoidCallback onTap;

  const GameCard({super.key, required this.game, required this.accent, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      key: ValueKey('game-${game.id}'),
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Ink(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [accent.withValues(alpha: 0.35), AppColors.bgCard],
          ),
          border: Border.all(color: accent.withValues(alpha: 0.6)),
        ),
        child: Row(children: [
          Container(
            width: 72,
            height: 72,
            alignment: Alignment.center,
            decoration: BoxDecoration(
                color: AppColors.bgPrimary.withValues(alpha: 0.5), borderRadius: BorderRadius.circular(18)),
            child: Text(game.emoji, style: const TextStyle(fontSize: 40)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(child: Text(game.name, style: AppTypography.titleMedium.copyWith(fontSize: 19))),
                if (game.isNew) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: AppColors.accentAmber, borderRadius: BorderRadius.circular(20)),
                    child: Text('¡Nuevo!',
                        style: AppTypography.labelBold.copyWith(color: AppColors.bgPrimary, fontSize: 11)),
                  ),
                ],
              ]),
              const SizedBox(height: 6),
              Text(game.tagline, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
            ]),
          ),
          const Icon(Icons.play_circle_fill_rounded, size: 36, color: AppColors.textPrimary),
        ]),
      ),
    );
  }
}
