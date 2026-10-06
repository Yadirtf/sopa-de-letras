import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/word_search_summary_entity.dart';

class CatalogCardWidget extends StatelessWidget {
  final WordSearchSummaryEntity item;
  final VoidCallback onTap;

  const CatalogCardWidget({
    super.key,
    required this.item,
    required this.onTap,
  });

  Color _getDifficultyColor(String diff) {
    switch (diff) {
      case 'EASY':
        return AppColors.accentEmerald;
      case 'MEDIUM':
        return AppColors.accentAmber;
      case 'HARD':
        return AppColors.accentRose;
      default:
        return AppColors.accentViolet;
    }
  }

  String _getDifficultyLabel(String diff) {
    switch (diff) {
      case 'EASY':
        return 'Fácil';
      case 'MEDIUM':
        return 'Medio';
      case 'HARD':
        return 'Difícil';
      default:
        return diff;
    }
  }

  @override
  Widget build(BuildContext context) {
    final diffColor = _getDifficultyColor(item.difficulty);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.bgCard.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          splashColor: AppColors.accentViolet.withValues(alpha: 0.15),
          highlightColor: AppColors.borderGlow.withValues(alpha: 0.1),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.title,
                        style: AppTypography.heading3.copyWith(fontSize: 16),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: diffColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: diffColor.withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        _getDifficultyLabel(item.difficulty),
                        style: AppTypography.caption.copyWith(
                          color: diffColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                if (item.description != null && item.description!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    item.description!,
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildMetaItem(Icons.grid_4x4_rounded, '${item.gridSize}x${item.gridSize}'),
                    const SizedBox(width: 14),
                    _buildMetaItem(Icons.spellcheck_rounded, '${item.wordCount} palabras'),
                    const SizedBox(width: 14),
                    _buildMetaItem(Icons.play_circle_outline_rounded, '${item.playCount} jugadas'),
                    const Spacer(),
                    const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.accentCyan),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetaItem(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textMuted),
        const SizedBox(width: 4),
        Text(
          text,
          style: AppTypography.caption.copyWith(color: AppColors.textSecondary, fontSize: 11),
        ),
      ],
    );
  }
}
