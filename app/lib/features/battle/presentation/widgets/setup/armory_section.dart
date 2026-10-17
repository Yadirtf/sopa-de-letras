import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../../domain/entities/battle_config.dart';
import 'setup_section.dart';
import '../../art/battle_art_images.dart';

/// Armería (cuántos usos de cada arma especial) y forma de disparar.
class ArmorySection extends StatelessWidget {
  final List<BattleWeapon> weapons;
  final Map<String, int> uses;
  final int maxUses;
  final BattleInputMode inputMode;
  final void Function(String weaponId, int uses) onUsesChanged;
  final ValueChanged<BattleInputMode> onInputModeChanged;

  const ArmorySection({
    super.key,
    required this.weapons,
    required this.uses,
    required this.maxUses,
    required this.inputMode,
    required this.onUsesChanged,
    required this.onInputModeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SetupSection(
      step: 4,
      title: 'Armería y disparos',
      hint: 'Cada arma deja su propia marca en la arena. Pon 0 para no usarla.',
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        for (final w in weapons) _row(w),
        const SizedBox(height: 12),
        Text('¿Cómo se elige la casilla?', style: AppTypography.labelBold),
        const SizedBox(height: 8),
        SegmentedButton<BattleInputMode>(
          segments: const [
            ButtonSegment(
              value: BattleInputMode.tapOrType,
              icon: Icon(Icons.touch_app_rounded),
              label: Text('Tocar o escribir'),
            ),
            ButtonSegment(
              value: BattleInputMode.typeOnly,
              icon: Icon(Icons.keyboard_rounded),
              label: Text('Solo escribir'),
            ),
          ],
          selected: {inputMode},
          onSelectionChanged: (s) => onInputModeChanged(s.first),
        ),
        const SizedBox(height: 6),
        Text(
          inputMode == BattleInputMode.typeOnly
              ? 'Como en papel: se escribe la coordenada, por ejemplo H11 o 11-H.'
              : 'Se puede tocar la casilla con el dedo o escribir la coordenada.',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
      ]),
    );
  }

  Widget _row(BattleWeapon w) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(children: [
        WeaponIcon(weaponId: w.id, size: 44),
        const SizedBox(width: 10),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(w.name, style: AppTypography.labelBold),
            Text(w.description, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
          ]),
        ),
        if (w.isUnlimited)
          Text('Siempre', style: AppTypography.labelBold.copyWith(color: AppColors.accentEmerald))
        else
          NumberStepper(
            keyPrefix: 'weapon-${w.id}',
            value: uses[w.id] ?? w.defaultUses,
            min: 0,
            max: maxUses,
            onChanged: (v) => onUsesChanged(w.id, v),
          ),
      ]),
    );
  }
}
