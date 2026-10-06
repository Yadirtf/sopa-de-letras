import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Tarjeta numerada de un paso del editor. El círculo pasa a ✓ verde al
/// completar el paso, así se ve de un vistazo qué falta.
class EditorStepCard extends StatelessWidget {
  final int step;
  final String title;
  final String? subtitle;
  final bool done;
  final Widget child;

  const EditorStepCard({
    super.key,
    required this.step,
    required this.title,
    required this.child,
    this.subtitle,
    this.done = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = done ? AppColors.accentEmerald : AppColors.accentViolet;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: done ? AppColors.accentEmerald.withValues(alpha: 0.4) : AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.2), shape: BoxShape.circle),
                child: done
                    ? Icon(Icons.check_rounded, size: 20, color: color, semanticLabel: 'Paso completo')
                    : Text('$step', style: AppTypography.labelBold.copyWith(color: color)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTypography.heading3.copyWith(fontSize: 17)),
                    if (subtitle != null)
                      Text(subtitle!, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
