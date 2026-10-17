import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import 'scene/choreo.dart';

/// Cartel "Quién: texto" bajo la escena de la reacción; entra con un rebote.
class ReactionCaption extends StatelessWidget {
  final String text;
  final Offset at;
  final double p;
  const ReactionCaption({super.key, required this.text, required this.at, required this.p});

  @override
  Widget build(BuildContext context) {
    if (p <= 0) return const SizedBox.shrink();
    return Positioned(
      left: 16,
      right: 16,
      top: at.dy,
      child: Center(
        child: Transform.scale(
          scale: backOut(p),
          child: Container(
            key: const ValueKey('reaction-caption'),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.bgCard.withValues(alpha: 0.94),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.accentAmber, width: 2),
              boxShadow: [BoxShadow(color: AppColors.accentAmber.withValues(alpha: 0.35), blurRadius: 18)],
            ),
            child: Text(text, style: AppTypography.labelBold.copyWith(fontSize: 19)),
          ),
        ),
      ),
    );
  }
}
