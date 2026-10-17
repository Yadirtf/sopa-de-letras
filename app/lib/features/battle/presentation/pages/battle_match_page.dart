import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/battle_view.dart';
import '../providers/battle_match_notifier.dart';
import '../providers/battle_providers.dart';
import '../views/battle_duel_view.dart';
import '../views/battle_placement_view.dart';
import '../views/battle_result_view.dart';
import '../views/battle_waiting_view.dart';
import '../sound/battle_sounds.dart';
import '../widgets/reactions/reaction_overlay.dart';
import '../widgets/reactions/reaction_tray.dart';

/// Una sola pantalla para toda la batalla: cambia sola de sala de espera a
/// colocar, al duelo y al final, siguiendo lo que diga el servidor.
class BattleMatchPage extends ConsumerWidget {
  final String code;

  const BattleMatchPage({super.key, required this.code});

  Future<void> _leave(BuildContext context, WidgetRef ref, BattleView? view) async {
    final inBattle = view != null && (view.status == BattleStatus.placing || view.status == BattleStatus.playing);
    if (inBattle && !await _confirmSurrender(context)) return;
    if (view != null && view.status != BattleStatus.finished) {
      await ref.read(battleMatchProvider(code).notifier).leave();
    }
    if (context.mounted) context.go('/home');
  }

  Future<bool> _confirmSurrender(BuildContext context) async {
    final yes = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: const Text('¿Rendirte?'),
        content: const Text('Si sales ahora, tu rival gana la batalla.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Seguir peleando')),
          FilledButton(
            key: const ValueKey('battle-surrender-confirm'),
            style: FilledButton.styleFrom(backgroundColor: AppColors.accentRose),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Rendirme'),
          ),
        ],
      ),
    );
    return yes ?? false;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(battleMatchProvider(code));
    final catalog = ref.watch(battleCatalogProvider);
    ref.listen(battleMatchProvider(code).select((s) => s.message), (_, message) {
      if (message == null) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(message)));
      ref.read(battleMatchProvider(code).notifier).clearMessage();
    });

    // Toque de corneta cuando el turno pasa a ser mío.
    ref.listen(battleMatchProvider(code).select((s) => s.view?.status == BattleStatus.playing && s.view!.isMyTurn),
        (before, mine) => mine && before != true ? ref.read(battleSoundsProvider.notifier).play(BattleSound.turn) : null);
    final soundOn = ref.watch(battleSoundsProvider);

    final view = state.view;
    final canReact = view != null && view.status != BattleStatus.waiting && view.enemy != null && catalog.hasValue;
    Widget body;
    if (state.fatalError != null) {
      body = _Problem(message: state.fatalError!, onBack: () => context.go('/batalla'));
    } else if (view == null || !catalog.hasValue) {
      body = const Center(child: CircularProgressIndicator());
    } else {
      final c = catalog.requireValue;
      body = switch (view.status) {
        BattleStatus.waiting => BattleWaitingView(view: view, catalog: c),
        BattleStatus.placing => BattlePlacementView(code: code, catalog: c),
        BattleStatus.playing => BattleDuelView(code: code, catalog: c),
        BattleStatus.finished => BattleResultView(code: code, catalog: c),
      };
      body = ReactionOverlay(code: code, catalog: c, child: body);
    }

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        leading: IconButton(
          key: const ValueKey('battle-leave'),
          icon: const Icon(Icons.close_rounded),
          onPressed: () => _leave(context, ref, view),
        ),
        title: Text('Batalla $code', style: AppTypography.titleMedium),
        actions: [
          if (canReact) ReactionButton(code: code, catalog: catalog.requireValue),
          IconButton(
            key: const ValueKey('battle-sound'),
            tooltip: soundOn ? 'Silenciar' : 'Activar sonido',
            onPressed: ref.read(battleSoundsProvider.notifier).toggle,
            icon: Icon(soundOn ? Icons.volume_up_rounded : Icons.volume_off_rounded),
          ),
        ],
      ),
      body: Column(children: [
        if (!state.connected)
          Container(
            width: double.infinity,
            color: AppColors.accentRose.withValues(alpha: 0.2),
            padding: const EdgeInsets.all(8),
            child: const Text('Se cortó la conexión. Reconectando…', textAlign: TextAlign.center),
          ),
        Expanded(child: SafeArea(top: false, child: body)),
      ]),
    );
  }
}

class _Problem extends StatelessWidget {
  final String message;
  final VoidCallback onBack;
  const _Problem({required this.message, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.explore_off_rounded, size: 48, color: AppColors.textSecondary),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center, style: AppTypography.titleMedium),
          const SizedBox(height: 16),
          FilledButton(onPressed: onBack, child: const Text('Volver')),
        ]),
      ),
    );
  }
}
