import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import 'setup_section.dart';
import '../../art/battle_art_images.dart';

/// Terrenos inspirados en batallas reales. Al elegir uno cambia el ejército.
class TerrainPicker extends StatelessWidget {
  final List<BattleTerrain> terrains;
  final String selectedId;
  final ValueChanged<String> onSelected;

  const TerrainPicker({super.key, required this.terrains, required this.selectedId, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    final selected = terrains.firstWhere((t) => t.id == selectedId, orElse: () => terrains.first);
    return SetupSection(
      step: 2,
      title: 'Terreno',
      hint: 'Inspirado en ${selected.inspiredBy}.',
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: [for (final t in terrains) _tile(t, t.id == selectedId)],
      ),
    );
  }

  Widget _tile(BattleTerrain t, bool active) {
    return InkWell(
      key: ValueKey('terrain-${t.id}'),
      borderRadius: BorderRadius.circular(14),
      onTap: () => onSelected(t.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 96,
        height: 74,
        alignment: Alignment.bottomCenter,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: t.ground,
          image: terrainBackdrop(t.id, opacity: active ? 1 : 0.7),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: active ? AppColors.accentAmber : Colors.transparent, width: 2.5),
          boxShadow: active ? [BoxShadow(color: AppColors.accentAmber.withValues(alpha: 0.4), blurRadius: 10)] : null,
        ),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 4),
          color: Colors.black.withValues(alpha: 0.55),
          child: Text(t.name, textAlign: TextAlign.center, style: AppTypography.labelBold.copyWith(fontSize: 13)),
        ),
      ),
    );
  }
}
