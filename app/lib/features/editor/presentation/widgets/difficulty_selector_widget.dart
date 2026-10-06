import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class DifficultySelectorWidget extends StatelessWidget {
  final String selectedDifficulty;
  final int gridSize;
  final ValueChanged<String> onDifficultyChanged;
  final ValueChanged<int> onGridSizeChanged;

  static const options = [
    {'value': 'EASY', 'label': 'Fácil', 'dir': '2 dir (Horizontal/Vertical)', 'color': AppColors.accentEmerald},
    {'value': 'MEDIUM', 'label': 'Medio', 'dir': '4 dir (+ Diagonales)', 'color': AppColors.accentAmber},
    {'value': 'HARD', 'label': 'Difícil', 'dir': '8 dir (Inversas y Cruzadas)', 'color': AppColors.accentRose},
  ];

  const DifficultySelectorWidget({
    super.key,
    required this.selectedDifficulty,
    required this.gridSize,
    required this.onDifficultyChanged,
    required this.onGridSizeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Dificultad de Juego', style: AppTypography.heading3.copyWith(fontSize: 15)),
        const SizedBox(height: 8),
        Row(
          children: options.map((opt) {
            final isSelected = selectedDifficulty == opt['value'];
            final color = opt['color'] as Color;

            return Expanded(
              child: GestureDetector(
                onTap: () => onDifficultyChanged(opt['value'] as String),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? color.withValues(alpha: 0.2) : AppColors.bgCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? color : AppColors.borderSubtle,
                      width: isSelected ? 1.5 : 1.0,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        opt['label'] as String,
                        style: AppTypography.caption.copyWith(
                          color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        (opt['value'] as String) == 'EASY' ? '2 dir' : (opt['value'] as String) == 'MEDIUM' ? '4 dir' : '8 dir',
                        style: AppTypography.caption.copyWith(
                          fontSize: 10,
                          color: isSelected ? color : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Tamaño de Cuadrícula', style: AppTypography.heading3.copyWith(fontSize: 15)),
            Text('${gridSize}x$gridSize', style: AppTypography.caption.copyWith(color: AppColors.accentCyan, fontWeight: FontWeight.bold)),
          ],
        ),
        Slider(
          value: gridSize.toDouble(),
          min: 10,
          max: 20,
          divisions: 10,
          activeColor: AppColors.accentCyan,
          inactiveColor: AppColors.bgCard,
          label: '${gridSize}x$gridSize',
          onChanged: (val) => onGridSizeChanged(val.toInt()),
        ),
      ],
    );
  }
}
