import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/icon_label.dart';
import '../../domain/entities/game_event_entities.dart';

class LiveRaceBarWidget extends StatelessWidget {
  final List<LeaderboardEntryEntity> leaderboard;

  const LiveRaceBarWidget({super.key, required this.leaderboard});

  @override
  Widget build(BuildContext context) {
    if (leaderboard.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconLabel(
                icon: Icons.sports_score_rounded,
                text: 'Carrera en Vivo',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.accentCyan,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${leaderboard.length} competidores',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...leaderboard.map((entry) {
            Color playerColor = AppColors.accentViolet;
            try {
              playerColor = Color(int.parse(entry.colorHex.replaceFirst('#', '0xFF')));
            } catch (_) {}

            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: playerColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            entry.username,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '${entry.score} pts • ${entry.wordsCount} pal.',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.accentAmber,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Stack(
                    children: [
                      Container(
                        height: 6,
                        decoration: BoxDecoration(
                          color: AppColors.bgCard,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      AnimatedFractionallySizedBox(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOutExpo,
                        widthFactor: (entry.progressPercent / 100).clamp(0.02, 1.0),
                        child: Container(
                          height: 6,
                          decoration: BoxDecoration(
                            color: playerColor,
                            borderRadius: BorderRadius.circular(3),
                            boxShadow: [
                              BoxShadow(
                                color: playerColor.withValues(alpha: 0.5),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
