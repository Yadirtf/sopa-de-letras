import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../art/battle_art_images.dart';

/// Armas disponibles con los usos que quedan. Las agotadas o apagadas no aparecen.
class WeaponPicker extends StatelessWidget {
  final List<BattleWeapon> weapons;
  final Map<String, int> ammo;
  final String selected;
  final ValueChanged<String> onSelected;

  const WeaponPicker(
      {super.key, required this.weapons, required this.ammo, required this.selected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    final available = weapons.where((w) => w.isUnlimited || (ammo[w.id] ?? 0) > 0).toList();
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(children: [
        for (final w in available)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              key: ValueKey('weapon-${w.id}'),
              selected: selected == w.id,
              onSelected: (_) => onSelected(w.id),
              selectedColor: AppColors.accentAmber.withValues(alpha: 0.3),
              avatar: WeaponIcon(weaponId: w.id, size: 26),
              label: Text(
                w.isUnlimited ? w.name : '${w.name} ×${ammo[w.id]}',
                style: AppTypography.labelBold.copyWith(fontSize: 13),
              ),
            ),
          ),
      ]),
    );
  }
}
