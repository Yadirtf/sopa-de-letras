import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class ArcadeCountdownOverlay extends StatelessWidget {
  final int count;

  const ArcadeCountdownOverlay({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    final text = count > 0 ? '$count' : '¡A BUSCAR!';
    final color = count > 0 ? AppColors.accentAmber : AppColors.accentEmerald;

    return Container(
      color: AppColors.bgPrimary.withValues(alpha: 0.85),
      child: Center(
        child: TweenAnimationBuilder<double>(
          key: ValueKey(count),
          tween: Tween(begin: 0.5, end: 1.2),
          duration: const Duration(milliseconds: 600),
          curve: Curves.elasticOut,
          builder: (context, value, child) {
            return Transform.scale(
              scale: value,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  shape: count > 0 ? BoxShape.circle : BoxShape.rectangle,
                  borderRadius: count > 0 ? null : BorderRadius.circular(24),
                  border: Border.all(color: color, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: color.withValues(alpha: 0.6),
                      blurRadius: 30,
                      spreadRadius: 4,
                    ),
                  ],
                ),
                child: Text(
                  text,
                  style: AppTypography.displayLarge.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: count > 0 ? 56 : 32,
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
