import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import 'setup_section.dart';

/// Equipo de batalla del terreno: cuántas figuras de cada una lleva cada jugador.
class ArmySection extends StatelessWidget {
  final BattleTerrain terrain;
  final Map<String, int> army;
  final int arenaCells;
  final BattleLimits limits;
  final bool edited;
  final void Function(String unitId, int count) onChanged;
  final VoidCallback onRecommend;

  const ArmySection({
    super.key,
    required this.terrain,
    required this.army,
    required this.arenaCells,
    required this.limits,
    required this.edited,
    required this.onChanged,
    required this.onRecommend,
  });

  @override
  Widget build(BuildContext context) {
    final units = army.values.fold(0, (a, b) => a + b);
    final cells = terrain.units.fold(0, (sum, u) => sum + (army[u.id] ?? 0) * u.cells);
    final percent = arenaCells == 0 ? 0 : (cells * 100 / arenaCells).round();
    final tooMany = cells > arenaCells * limits.maxCoverage;

    return SetupSection(
      step: 3,
      title: 'Ejército de ${terrain.name.toLowerCase()}',
      hint: '$units figuras ocupan $cells casillas ($percent % de la arena). Las figuras no se pueden tocar.',
      trailing: edited
          ? TextButton(key: const ValueKey('army-recommend'), onPressed: onRecommend, child: const Text('Recomendado'))
          : const Chip(label: Text('Recomendado'), visualDensity: VisualDensity.compact),
      child: Column(children: [
        for (final u in terrain.units) _row(u),
        if (tooMany)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Son demasiadas figuras para esta arena. Agranda la arena o quita figuras.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose),
            ),
          ),
      ]),
    );
  }

  Widget _row(BattleUnitType u) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(children: [
        Text(u.emoji, style: const TextStyle(fontSize: 26)),
        const SizedBox(width: 10),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(u.name, style: AppTypography.labelBold),
            Text('Ocupa ${u.footprint} casillas',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
          ]),
        ),
        NumberStepper(
          keyPrefix: 'unit-${u.id}',
          value: army[u.id] ?? 0,
          min: 0,
          max: limits.maxPerUnit,
          onChanged: (v) => onChanged(u.id, v),
        ),
      ]),
    );
  }
}
