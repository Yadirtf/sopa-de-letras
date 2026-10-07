import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/game_event_entities.dart';

/// Botones del final: revancha (u "otra vez" en solitario) y volver al inicio.
class PodiumActions extends StatelessWidget {
  final bool solo;
  final RematchVoteStateEntity? rematch;
  final VoidCallback onRematch;
  final VoidCallback onExit;

  const PodiumActions({
    super.key,
    required this.solo,
    required this.rematch,
    required this.onRematch,
    required this.onExit,
  });

  @override
  Widget build(BuildContext context) {
    final label = solo
        ? 'Jugar otra vez'
        : rematch != null
            ? 'Revancha (${rematch!.votesCount}/${rematch!.totalPlayers})'
            : '¡Revancha!';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(colors: [Color(0xFFFFC94A), Color(0xFFF59E0B)]),
            boxShadow: [
              BoxShadow(
                  color: AppColors.accentAmber.withValues(alpha: 0.45), blurRadius: 18, offset: const Offset(0, 6))
            ],
          ),
          child: ElevatedButton.icon(
            key: const ValueKey('podium-rematch'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            icon: const Icon(Icons.replay_rounded, color: Color(0xFF2A1458)),
            label: Text(label,
                style: AppTypography.labelLarge
                    .copyWith(color: const Color(0xFF2A1458), fontWeight: FontWeight.w800, fontSize: 16)),
            onPressed: onRematch,
          ),
        ),
        const SizedBox(height: 10),
        TextButton.icon(
          key: const ValueKey('podium-exit'),
          style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
          onPressed: onExit,
          icon: const Icon(Icons.home_rounded, color: Color(0xFFE9DDFF)),
          label: Text('Volver al inicio', style: AppTypography.labelLarge.copyWith(color: const Color(0xFFE9DDFF))),
        ),
      ],
    );
  }
}
