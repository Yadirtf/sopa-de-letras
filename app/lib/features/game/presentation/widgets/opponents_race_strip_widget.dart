import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../helpers/player_color.dart';
import '../providers/race_standings.dart';

/// Carrera de jugadores arriba del tablero: una frase de quien va ganando y una
/// tarjetita por jugador con sus palabras, para mirarla de reojo sin dejar de jugar.
class OpponentsRaceStripWidget extends StatelessWidget {
  final List<RaceStanding> standings;
  final int totalWords;

  const OpponentsRaceStripWidget({super.key, required this.standings, required this.totalWords});

  @override
  Widget build(BuildContext context) {
    if (standings.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Icon(Icons.emoji_events_rounded, size: 18, color: AppColors.accentAmber),
            const SizedBox(width: 6),
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Text(
                  raceHeadline(standings),
                  key: ValueKey(raceHeadline(standings)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.labelLarge.copyWith(color: AppColors.textPrimary),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 66,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: standings.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, i) => _RacerCard(standing: standings[i], totalWords: totalWords),
          ),
        ),
      ],
    );
  }
}

class _RacerCard extends StatelessWidget {
  final RaceStanding standing;
  final int totalWords;

  const _RacerCard({required this.standing, required this.totalWords});

  @override
  Widget build(BuildContext context) {
    final color = playerColor(standing.colorHex);
    final progress = totalWords == 0 ? 0.0 : (standing.wordsCount / totalWords).clamp(0.0, 1.0);
    final name = standing.isMe ? 'Tú' : standing.username;
    final accent = standing.isLeader ? AppColors.accentAmber : color;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: 124,
      padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
      decoration: BoxDecoration(
        color: standing.isMe ? color.withValues(alpha: 0.16) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border:
            Border.all(color: accent.withValues(alpha: standing.isLeader ? 1 : 0.5), width: standing.isLeader ? 2 : 1),
      ),
      child: Opacity(
        opacity: standing.isConnected ? 1 : 0.55,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('${standing.place}º', style: AppTypography.labelLarge.copyWith(color: accent, fontSize: 13)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style:
                          AppTypography.bodySmall.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
                ),
                if (standing.isLeader)
                  const Icon(Icons.workspace_premium_rounded, size: 16, color: AppColors.accentAmber),
                if (!standing.isConnected) const Icon(Icons.wifi_off_rounded, size: 14, color: AppColors.textSecondary),
              ],
            ),
            const Spacer(),
            Text('${standing.wordsCount}/$totalWords palabras',
                style: AppTypography.bodySmall.copyWith(fontSize: 11, color: AppColors.textSecondary)),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: TweenAnimationBuilder<double>(
                tween: Tween(end: progress),
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeOutExpo,
                builder: (_, value, __) => LinearProgressIndicator(
                  value: value,
                  minHeight: 5,
                  color: color,
                  backgroundColor: AppColors.bgSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
