import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class CatalogFilterChips extends StatelessWidget {
  final String selectedCategory;
  final String selectedDifficulty;
  final ValueChanged<String> onCategorySelected;
  final ValueChanged<String> onDifficultySelected;

  static const List<String> categories = [
    'TODAS',
    'NATURALEZA',
    'CIENCIA',
    'TECNOLOGIA',
    'HISTORIA',
    'ARTE',
    'DEPORTES',
  ];

  static const List<Map<String, String>> difficulties = [
    {'label': 'Todas', 'value': 'TODAS'},
    {'label': 'Fácil', 'value': 'EASY'},
    {'label': 'Medio', 'value': 'MEDIUM'},
    {'label': 'Difícil', 'value': 'HARD'},
  ];

  const CatalogFilterChips({
    super.key,
    required this.selectedCategory,
    required this.selectedDifficulty,
    required this.onCategorySelected,
    required this.onDifficultySelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Dificultades
        SizedBox(
          height: 38,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: difficulties.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final diff = difficulties[index];
              final isSelected = selectedDifficulty == diff['value'];
              return _buildChip(
                label: diff['label']!,
                isSelected: isSelected,
                activeColor: _getDifficultyColor(diff['value']!),
                onTap: () => onDifficultySelected(diff['value']!),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        // Categorías
        SizedBox(
          height: 34,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 6),
            itemBuilder: (context, index) {
              final cat = categories[index];
              final isSelected = selectedCategory == cat;
              return _buildCategoryChip(
                label: cat == 'TODAS' ? 'Todas las Categorías' : cat,
                isSelected: isSelected,
                onTap: () => onCategorySelected(cat),
              );
            },
          ),
        ),
      ],
    );
  }

  Color _getDifficultyColor(String diff) {
    switch (diff) {
      case 'EASY':
        return AppColors.accentEmerald;
      case 'MEDIUM':
        return AppColors.accentAmber;
      case 'HARD':
        return AppColors.accentRose;
      default:
        return AppColors.accentViolet;
    }
  }

  Widget _buildChip({
    required String label,
    required bool isSelected,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withValues(alpha: 0.25) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? activeColor : AppColors.borderSubtle,
            width: isSelected ? 1.5 : 1.0,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: activeColor.withValues(alpha: 0.3),
                blurRadius: 8,
              ),
          ],
        ),
        child: Center(
          child: Text(
            label,
            style: AppTypography.caption.copyWith(
              color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentCyan.withValues(alpha: 0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.accentCyan : AppColors.borderSubtle,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: AppTypography.caption.copyWith(
              color: isSelected ? AppColors.accentCyan : AppColors.textMuted,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
