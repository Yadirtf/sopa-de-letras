import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Dificultad explicada con palabras sencillas y tamaño de la cuadrícula.
class DifficultySelectorWidget extends StatelessWidget {
  final String selectedDifficulty;
  final int gridSize;
  final int minGridSize;
  final ValueChanged<String> onDifficultyChanged;
  final ValueChanged<int> onGridSizeChanged;

  static const _easy = (label: 'Fácil', hint: 'De lado y hacia abajo', icon: Icons.sentiment_satisfied_alt_rounded);
  static const _medium = (label: 'Medio', hint: 'También en diagonal', icon: Icons.local_fire_department_rounded);
  static const _hard = (label: 'Difícil', hint: 'Al revés y en todas direcciones', icon: Icons.bolt_rounded);
  static const _options = [
    (value: 'EASY', look: _easy, color: AppColors.accentEmerald),
    (value: 'MEDIUM', look: _medium, color: AppColors.accentAmber),
    (value: 'HARD', look: _hard, color: AppColors.accentRose),
  ];

  const DifficultySelectorWidget({
    super.key,
    required this.selectedDifficulty,
    required this.gridSize,
    required this.onDifficultyChanged,
    required this.onGridSizeChanged,
    this.minGridSize = 10,
  });

  String get _sizeName => gridSize <= 12
      ? 'Pequeña'
      : gridSize <= 16
          ? 'Mediana'
          : 'Grande';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            for (final opt in _options)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _DifficultyOption(
                    label: opt.look.label,
                    hint: opt.look.hint,
                    icon: opt.look.icon,
                    color: opt.color,
                    selected: selectedDifficulty == opt.value,
                    onTap: () => onDifficultyChanged(opt.value),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            const Icon(Icons.grid_on_rounded, color: AppColors.accentCyan, size: 20),
            const SizedBox(width: 8),
            Expanded(
                child:
                    Text('Tamaño: $_sizeName', style: AppTypography.labelBold.copyWith(color: AppColors.textPrimary))),
            Text('$gridSize × $gridSize letras', style: AppTypography.caption.copyWith(color: AppColors.accentCyan)),
          ],
        ),
        Slider(
          value: gridSize.toDouble(),
          min: 10,
          max: 20,
          divisions: 10,
          activeColor: AppColors.accentCyan,
          inactiveColor: AppColors.bgSecondary,
          label: '$gridSize × $gridSize',
          semanticFormatterCallback: (v) => 'Cuadrícula de ${v.toInt()} por ${v.toInt()}',
          // No deja achicarla tanto que la palabra más larga no quepa.
          onChanged: (val) => onGridSizeChanged(val.toInt() < minGridSize ? minGridSize : val.toInt()),
        ),
        if (minGridSize > 10)
          Text('Mínimo $minGridSize para que quepa tu palabra más larga.',
              style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }
}

class _DifficultyOption extends StatelessWidget {
  final String label;
  final String hint;
  final IconData icon;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _DifficultyOption({
    required this.label,
    required this.hint,
    required this.icon,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: 'Dificultad $label: $hint',
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          constraints: const BoxConstraints(minHeight: 112),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
          decoration: BoxDecoration(
            color: selected ? color.withValues(alpha: 0.2) : AppColors.bgSecondary,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: selected ? color : AppColors.borderSubtle, width: selected ? 2 : 1),
          ),
          child: Column(
            children: [
              Icon(icon, color: selected ? color : AppColors.textSecondary, size: 28),
              const SizedBox(height: 6),
              Text(label,
                  style: AppTypography.labelBold
                      .copyWith(color: selected ? AppColors.textPrimary : AppColors.textSecondary)),
              const SizedBox(height: 4),
              Text(hint,
                  textAlign: TextAlign.center,
                  style:
                      AppTypography.caption.copyWith(fontSize: 11, color: selected ? color : AppColors.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }
}
