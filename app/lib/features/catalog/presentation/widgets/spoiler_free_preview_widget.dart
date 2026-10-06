import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class SpoilerFreePreviewWidget extends StatelessWidget {
  final List<List<String>> previewGrid;
  final int gridSize;

  const SpoilerFreePreviewWidget({
    super.key,
    required this.previewGrid,
    required this.gridSize,
  });

  @override
  Widget build(BuildContext context) {
    final displayRows = previewGrid.take(8).toList();

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderGlow),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Matriz decorativa de fondo
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: displayRows.map((row) {
                  final displayCols = row.take(10).toList();
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: displayCols.map((char) {
                      return Container(
                        width: 22,
                        height: 22,
                        margin: const EdgeInsets.all(1.5),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.bgCard.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          char,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary.withValues(alpha: 0.6),
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      );
                    }).toList(),
                  );
                }).toList(),
              ),
            ),
            // Capa de desenfoque Anti-Spoilers (BackdropFilter)
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 4.5, sigmaY: 4.5),
                child: Container(
                  color: AppColors.bgPrimary.withValues(alpha: 0.35),
                ),
              ),
            ),
            // Badge Anti-Spoilers
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.bgCard.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.accentCyan),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accentCyan.withValues(alpha: 0.3),
                    blurRadius: 10,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.visibility_off_rounded,
                    size: 16,
                    color: AppColors.accentCyan,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Anti-Spoilers: Soluciones Ocultas',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
