import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_config.dart';
import '../providers/battle_providers.dart';
import '../providers/battle_setup_notifier.dart';
import '../widgets/setup/arena_size_section.dart';
import '../widgets/setup/armory_section.dart';
import '../widgets/setup/army_section.dart';
import '../widgets/setup/join_battle_card.dart';
import '../widgets/setup/terrain_picker.dart';

/// Entrada a La Batalla Más Temida: unirse con un código o armar una sala nueva
/// (arena, terreno, ejército, armería) para un amigo o contra la Abejita.
class BattleSetupPage extends ConsumerWidget {
  const BattleSetupPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalog = ref.watch(battleCatalogProvider);
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
        ),
        title: Text('La Batalla Más Temida', style: AppTypography.titleMedium),
      ),
      body: catalog.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _Retry(message: e.toString(), onRetry: () => ref.invalidate(battleCatalogProvider)),
        data: (c) => _SetupForm(catalog: c),
      ),
    );
  }
}

class _SetupForm extends ConsumerWidget {
  final BattleCatalog catalog;
  const _SetupForm({required this.catalog});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(battleSetupProvider.notifier);
    WidgetsBinding.instance.addPostFrameCallback((_) => notifier.init(catalog));
    final state = ref.watch(battleSetupProvider);
    final config = state.config;
    final terrain = catalog.terrain(config.terrainId);

    Future<void> create(BattleOpponent opponent) async {
      final code = await notifier.create(opponent);
      if (code != null && context.mounted) context.go('/batalla/$code');
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
      children: [
        JoinBattleCard(onJoin: (code) => context.go('/batalla/$code')),
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 4, 4, 12),
          child: Text('O arma tu propia batalla', style: AppTypography.titleLarge.copyWith(fontSize: 22)),
        ),
        ArenaSizeSection(
          cols: config.cols,
          rows: config.rows,
          limits: catalog.limits,
          onChanged: notifier.setSize,
          onSettled: notifier.sizeSettled,
        ),
        TerrainPicker(terrains: catalog.terrains, selectedId: config.terrainId, onSelected: notifier.setTerrain),
        ArmySection(
          terrain: terrain,
          army: config.army,
          arenaCells: config.cols * config.rows,
          limits: catalog.limits,
          edited: state.armyEdited,
          onChanged: notifier.setUnitCount,
          onRecommend: notifier.useRecommendation,
        ),
        ArmorySection(
          weapons: catalog.weapons,
          uses: config.weapons,
          maxUses: catalog.limits.maxWeaponUses,
          inputMode: config.inputMode,
          onUsesChanged: notifier.setWeaponUses,
          onInputModeChanged: notifier.setInputMode,
        ),
        if (state.error != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(state.error!, style: AppTypography.bodyMedium.copyWith(color: AppColors.accentRose)),
          ),
        FilledButton.icon(
          key: const ValueKey('battle-create-friend'),
          style:
              FilledButton.styleFrom(minimumSize: const Size.fromHeight(52), backgroundColor: AppColors.accentViolet),
          onPressed: state.isBusy || config.unitCount == 0 ? null : () => create(BattleOpponent.friend),
          icon: const Icon(Icons.group_rounded),
          label: const Text('Crear sala para un amigo'),
        ),
        const SizedBox(height: 10),
        OutlinedButton.icon(
          key: const ValueKey('battle-create-bot'),
          style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
          onPressed: state.isBusy || config.unitCount == 0 ? null : () => create(BattleOpponent.bot),
          icon: const Text('🐝', style: TextStyle(fontSize: 20)),
          label: const Text('Practicar contra la Abejita'),
        ),
      ],
    );
  }
}

class _Retry extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _Retry({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(message, textAlign: TextAlign.center, style: AppTypography.bodyMedium),
        const SizedBox(height: 12),
        FilledButton(onPressed: onRetry, child: const Text('Reintentar')),
      ]),
    );
  }
}
