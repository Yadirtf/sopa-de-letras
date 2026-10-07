import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/widgets/avatar_view.dart';
import '../../../domain/entities/game_event_entities.dart';

/// Del cuarto puesto en adelante: una fila por jugador con su avatar.
class PodiumRestList extends StatelessWidget {
  final List<PodiumEntryEntity> entries;
  final String? currentUserId;

  const PodiumRestList({super.key, required this.entries, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final e in entries)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: e.userId == currentUserId ? 0.1 : 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                  color:
                      e.userId == currentUserId ? AppColors.accentCyan.withValues(alpha: 0.6) : AppColors.borderSubtle),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 30,
                  child: Text('${e.rank}º', style: AppTypography.labelLarge.copyWith(color: AppColors.textSecondary)),
                ),
                AvatarView(avatarId: e.avatarUrl, size: 34),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    e.userId == currentUserId ? '${e.username} (tú)' : e.username,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.labelLarge,
                  ),
                ),
                Text('${e.score} pts', style: AppTypography.labelLarge.copyWith(color: AppColors.accentCyan)),
              ],
            ),
          ),
      ],
    );
  }
}
