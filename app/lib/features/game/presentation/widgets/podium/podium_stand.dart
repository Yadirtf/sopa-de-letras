import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/widgets/avatar_view.dart';
import '../../../domain/entities/game_event_entities.dart';

const _gold = Color(0xFFFFC94A);
const _silver = Color(0xFFCBD5E1);
const _bronze = Color(0xFFE08A4F);

/// Los tres escalones con el avatar de cada jugador encima. El del campeon es
/// el mas alto, lleva corona y brilla; los escalones suben al aparecer.
class PodiumStand extends StatelessWidget {
  final List<PodiumEntryEntity> podium;
  final String? currentUserId;

  const PodiumStand({super.key, required this.podium, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    Widget step(int i, double height, Color color, double avatar) => i < podium.length
        ? Expanded(
            child: _Step(
                entry: podium[i],
                height: height,
                color: color,
                avatarSize: avatar,
                isMe: podium[i].userId == currentUserId))
        : const Expanded(child: SizedBox());

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        if (podium.length > 1) step(1, 86, _silver, 62),
        step(0, 122, _gold, 92),
        if (podium.length > 1) step(2, 62, _bronze, 56),
      ],
    );
  }
}

class _Step extends StatelessWidget {
  final PodiumEntryEntity entry;
  final double height;
  final Color color;
  final double avatarSize;
  final bool isMe;

  const _Step({
    required this.entry,
    required this.height,
    required this.color,
    required this.avatarSize,
    required this.isMe,
  });

  @override
  Widget build(BuildContext context) {
    final champion = entry.rank == 1;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 700 + (3 - entry.rank.clamp(1, 3)) * 250),
      curve: Curves.easeOutBack,
      builder: (_, v, __) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Opacity(
            opacity: v.clamp(0.0, 1.0),
            child: Transform.scale(scale: 0.6 + 0.4 * v.clamp(0.0, 1.2), child: _avatar(champion)),
          ),
          const SizedBox(height: 6),
          Text(
            isMe ? '${entry.username} (tú)' : entry.username,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.labelLarge
                .copyWith(color: champion ? _gold : AppColors.textPrimary, fontSize: champion ? 16 : 13),
          ),
          Text('${entry.score} pts', style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 6),
          Container(
            height: height * v.clamp(0.0, 1.0),
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [color.withValues(alpha: 0.55), color.withValues(alpha: 0.08)],
              ),
              border: Border(top: BorderSide(color: color, width: 3)),
            ),
            alignment: Alignment.topCenter,
            padding: const EdgeInsets.only(top: 8),
            child: height * v > 40
                ? Text('${entry.rank}',
                    style: AppTypography.heading1.copyWith(color: Colors.white, fontSize: champion ? 40 : 30))
                : null,
          ),
        ],
      ),
    );
  }

  Widget _avatar(bool champion) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.topCenter,
      children: [
        Container(
          key: ValueKey('podium-avatar-${entry.userId}'),
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: SweepGradient(colors: [color, Colors.white, color, color.withValues(alpha: 0.6), color]),
            boxShadow: [
              BoxShadow(color: color.withValues(alpha: champion ? 0.7 : 0.4), blurRadius: champion ? 28 : 14)
            ],
          ),
          child: AvatarView(avatarId: entry.avatarUrl, size: avatarSize),
        ),
        if (champion)
          Positioned(
            top: -30,
            child: Icon(Icons.emoji_events_rounded,
                size: 34, color: _gold, shadows: [Shadow(color: _gold.withValues(alpha: 0.8), blurRadius: 16)]),
          ),
      ],
    );
  }
}
