import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/icon_badge.dart';

/// Estado vacío amable: un icono grande en su círculo de color, una frase y (opcional) un siguiente paso claro.
class SocialEmptyState extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SocialEmptyState({
    super.key,
    required this.icon,
    this.color = AppColors.accentCyan,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconBadge(icon: icon, color: color, size: 96),
            const SizedBox(height: 16),
            Text(title, textAlign: TextAlign.center, style: AppTypography.titleMedium),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center, style: AppTypography.bodyMedium),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentViolet,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(200, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: onAction,
                icon: const Icon(Icons.arrow_forward_rounded),
                label: Text(actionLabel!, style: AppTypography.labelBold.copyWith(color: Colors.white)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
