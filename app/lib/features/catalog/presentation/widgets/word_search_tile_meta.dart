import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/word_search_summary_entity.dart';

/// Mitad inferior de la tarjeta: título, autor y tamaño, palabras y partidas.
class WordSearchTileMeta extends StatelessWidget {
  final WordSearchSummaryEntity item;
  final Color accent;

  const WordSearchTileMeta({super.key, required this.item, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.labelBold.copyWith(fontSize: 15, height: 1.2),
          ),
          const SizedBox(height: 2),
          Text(
            'por ${item.creatorName}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.caption.copyWith(color: AppColors.textSecondary, fontSize: 11),
          ),
          const Spacer(),
          // Una sola línea que se encoge si no cabe: nunca rompe la tarjeta.
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Row(
              children: [
                _Fact(icon: Icons.grid_on_rounded, text: '${item.gridSize}×${item.gridSize}', color: accent),
                const SizedBox(width: 10),
                _Fact(icon: Icons.spellcheck_rounded, text: '${item.wordCount} palabras', color: accent),
                if (item.playCount > 0) ...[
                  const SizedBox(width: 10),
                  _Fact(icon: Icons.play_arrow_rounded, text: '${item.playCount}', color: AppColors.textSecondary),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;

  const _Fact({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 3),
        Text(text, style: AppTypography.caption.copyWith(fontSize: 11, color: AppColors.textPrimary)),
      ],
    );
  }
}
