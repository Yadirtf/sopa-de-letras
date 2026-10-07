import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/game_event_entities.dart';
import 'podium_summary.dart';

/// Titular dorado del podio ("¡Ganaste!", "¡Ana gana!", "¡Sopa completada!").
class PodiumHeadline extends StatelessWidget {
  final PodiumSummary summary;

  const PodiumHeadline({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.7, end: 1),
      duration: const Duration(milliseconds: 650),
      curve: Curves.elasticOut,
      builder: (_, s, child) => Transform.scale(scale: s, child: child),
      child: Column(
        children: [
          ShaderMask(
            shaderCallback: (r) => const LinearGradient(
              colors: [Color(0xFFFFE8A3), Color(0xFFFFC94A), Color(0xFFF59E0B), Color(0xFFFFE8A3)],
            ).createShader(r),
            child: Text(
              summary.headline.toUpperCase(),
              key: const ValueKey('podium-headline'),
              textAlign: TextAlign.center,
              maxLines: 2,
              style: AppTypography.heading1.copyWith(
                fontSize: 34,
                color: Colors.white,
                letterSpacing: 1.5,
                shadows: [Shadow(color: AppColors.accentAmber.withValues(alpha: 0.6), blurRadius: 18)],
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(summary.subtitle,
              textAlign: TextAlign.center, style: AppTypography.bodyMedium.copyWith(color: const Color(0xFFE9DDFF))),
        ],
      ),
    );
  }
}

/// Resumen del jugador que mira: puesto, puntos, palabras y trofeos ganados.
class PodiumMyResultCard extends StatelessWidget {
  final PodiumEntryEntity me;

  const PodiumMyResultCard({super.key, required this.me});

  @override
  Widget build(BuildContext context) {
    return Container(
      key: const ValueKey('podium-my-result'),
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFFC94A).withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          _Stat(
              icon: Icons.military_tech_rounded, value: '${me.rank}º', label: 'Puesto', color: const Color(0xFFFFC94A)),
          _Stat(icon: Icons.bolt_rounded, value: '${me.score}', label: 'Puntos', color: AppColors.accentCyan),
          _Stat(
              icon: Icons.spellcheck_rounded,
              value: '${me.wordsCount}',
              label: 'Palabras',
              color: AppColors.accentEmerald),
          _Stat(
              icon: Icons.emoji_events_rounded,
              value: '+${me.trophiesEarned}',
              label: 'Trofeos',
              color: AppColors.accentAmber),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _Stat({required this.icon, required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 4),
          Text(value, style: AppTypography.heading2.copyWith(fontSize: 20, color: AppColors.textPrimary)),
          Text(label, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }
}
