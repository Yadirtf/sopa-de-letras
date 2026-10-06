import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class CatalogEmptyState extends StatelessWidget {
  final VoidCallback onClearFilters;

  const CatalogEmptyState({
    super.key,
    required this.onClearFilters,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off_rounded, size: 64, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text('No se encontraron sopas', style: AppTypography.heading3),
            const SizedBox(height: 8),
            Text(
              'Prueba con otros filtros o términos de búsqueda.',
              textAlign: TextAlign.center,
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: onClearFilters,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentViolet,
                foregroundColor: AppColors.textPrimary,
              ),
              child: const Text('Limpiar Filtros'),
            ),
          ],
        ),
      ),
    );
  }
}
