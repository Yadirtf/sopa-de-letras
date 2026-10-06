import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/game_event_entities.dart';

class TargetWordsListWidget extends StatelessWidget {
  final List<String> words;
  final Map<String, WordFoundEventEntity> claimedWords;

  const TargetWordsListWidget({
    super.key,
    required this.words,
    required this.claimedWords,
  });

  @override
  Widget build(BuildContext context) {
    if (words.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgCard.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Palabras a Encontrar',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${claimedWords.length}/${words.length}',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.accentEmerald,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: words.map((word) {
              final upper = word.toUpperCase();
              final isFound = claimedWords.containsKey(upper);
              final claimEvent = claimedWords[upper];

              Color finderColor = AppColors.accentEmerald;
              if (claimEvent != null) {
                try {
                  finderColor = Color(
                    int.parse(claimEvent.colorHex.replaceFirst('#', '0xFF')),
                  );
                } catch (_) {}
              }

              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOutExpo,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isFound
                      ? finderColor.withValues(alpha: 0.2)
                      : AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isFound ? finderColor : AppColors.borderSubtle,
                    width: isFound ? 1.5 : 1.0,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isFound) ...[
                      Icon(Icons.check_circle_rounded, size: 14, color: finderColor),
                      const SizedBox(width: 4),
                    ],
                    Text(
                      word,
                      style: AppTypography.bodySmall.copyWith(
                        color: isFound ? finderColor : AppColors.textPrimary,
                        fontWeight: isFound ? FontWeight.bold : FontWeight.w500,
                        decoration:
                            isFound ? TextDecoration.lineThrough : TextDecoration.none,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
