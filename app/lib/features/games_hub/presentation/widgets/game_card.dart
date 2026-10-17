import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../battle/presentation/art/battle_art.dart';
import '../../../battle/presentation/art/battle_art_images.dart';
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
          _GameArt(gameId: game.id),
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

/// Dibujo de cada juego: el tanque 3D en el desierto o unas fichas de letras.
class _GameArt extends StatelessWidget {
  final String gameId;
  const _GameArt({required this.gameId});

  @override
  Widget build(BuildContext context) {
    final battle = gameId == 'battle';
    return Container(
      width: 76,
      height: 76,
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary.withValues(alpha: 0.5),
        image: battle ? terrainBackdrop('DESERT') : null,
        borderRadius: BorderRadius.circular(18),
      ),
      child: battle
          ? Image.asset(BattleArt.unit('tank'), fit: BoxFit.contain)
          : GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 4,
              crossAxisSpacing: 4,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                for (final l in 'SOPA'.split(''))
                  Container(
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: AppColors.accentCyan, borderRadius: BorderRadius.circular(6)),
                    child: Text(l, style: AppTypography.titleMedium.copyWith(color: AppColors.bgPrimary)),
                  ),
              ],
            ),
    );
  }
}
