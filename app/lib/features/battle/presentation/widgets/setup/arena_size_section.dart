import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../../domain/entities/battle_coordinate.dart';
import 'setup_section.dart';

/// Tamaño libre de la arena: columnas (letras) y filas (números).
class ArenaSizeSection extends StatelessWidget {
  final int cols;
  final int rows;
  final BattleLimits limits;
  final void Function({int? cols, int? rows}) onChanged;
  final VoidCallback onSettled;

  const ArenaSizeSection({
    super.key,
    required this.cols,
    required this.rows,
    required this.limits,
    required this.onChanged,
    required this.onSettled,
  });

  @override
  Widget build(BuildContext context) {
    final lastLetter = BattleCoordinate.column(cols - 1);
    return SetupSection(
      step: 1,
      title: 'Tamaño de la arena',
      hint: 'Columnas de A a $lastLetter y filas de 1 a $rows: ${cols * rows} casillas.',
      trailing: Text('$cols × $rows', style: AppTypography.titleMedium.copyWith(color: AppColors.accentCyan)),
      child: Column(children: [
        _slider('Columnas', cols, limits.minCols, limits.maxCols, (v) => onChanged(cols: v), 'arena-cols'),
        _slider('Filas', rows, limits.minRows, limits.maxRows, (v) => onChanged(rows: v), 'arena-rows'),
      ]),
    );
  }

  Widget _slider(String label, int value, int min, int max, ValueChanged<int> onChange, String key) {
    return Row(children: [
      SizedBox(width: 78, child: Text(label, style: AppTypography.bodyMedium)),
      Expanded(
        child: Slider(
          key: ValueKey(key),
          value: value.toDouble(),
          min: min.toDouble(),
          max: max.toDouble(),
          divisions: max - min,
          label: '$value',
          activeColor: AppColors.accentViolet,
          onChanged: (v) => onChange(v.round()),
          onChangeEnd: (_) => onSettled(),
        ),
      ),
      NumberStepper(
        value: value,
        min: min,
        max: max,
        keyPrefix: key,
        onChanged: (v) {
          onChange(v);
          onSettled();
        },
      ),
    ]);
  }
}
