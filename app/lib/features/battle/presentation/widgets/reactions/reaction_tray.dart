import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../providers/battle_match_notifier.dart';
import 'reaction_sprite.dart';

/// Botón de la barra superior: un globo de diálogo 3D que guiña el ojo y abre
/// las reacciones. Tras mandar una espera a que termine la escena (y el
/// servidor deja pasar la siguiente) para no hacer spam.
class ReactionButton extends ConsumerStatefulWidget {
  final String code;
  final BattleCatalog catalog;

  const ReactionButton({super.key, required this.code, required this.catalog});

  @override
  ConsumerState<ReactionButton> createState() => _ReactionButtonState();
}

class _ReactionButtonState extends ConsumerState<ReactionButton> {
  static const _cooldown = Duration(milliseconds: 2500);
  DateTime _readyAt = DateTime(2000);

  Future<void> _open() async {
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.bgSecondary,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _Tray(reactions: widget.catalog.reactions),
    );
    if (picked == null || !mounted) return;
    setState(() => _readyAt = DateTime.now().add(_cooldown));
    Future.delayed(_cooldown, () => mounted ? setState(() {}) : null);
    await ref.read(battleMatchProvider(widget.code).notifier).sendReaction(picked);
  }

  @override
  Widget build(BuildContext context) {
    final ready = DateTime.now().isAfter(_readyAt);
    return IconButton(
      key: const ValueKey('battle-react'),
      tooltip: 'Mandar una reacción',
      onPressed: ready ? _open : null,
      icon: AnimatedOpacity(
        opacity: ready ? 1 : 0.35,
        duration: const Duration(milliseconds: 250),
        child: const ReactionSprite(reactionId: 'tray_icon', size: 38),
      ),
    );
  }
}

class _Tray extends StatefulWidget {
  final List<BattleReaction> reactions;
  const _Tray({required this.reactions});

  @override
  State<_Tray> createState() => _TrayState();
}

class _TrayState extends State<_Tray> {
  bool _faces = true;

  @override
  Widget build(BuildContext context) {
    final shown = widget.reactions.where((r) => r.face == _faces).toList();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 16, 12, 8),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Mándale una reacción a tu rival', style: AppTypography.titleMedium),
          const SizedBox(height: 12),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            _tab('Caras', Icons.mood_rounded, true),
            const SizedBox(width: 10),
            _tab('De guerra', Icons.local_fire_department_rounded, false),
          ]),
          const SizedBox(height: 8),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: GridView.count(
              key: ValueKey(_faces),
              shrinkWrap: true,
              crossAxisCount: _faces ? 3 : 4,
              childAspectRatio: _faces ? 0.95 : 0.8,
              physics: const NeverScrollableScrollPhysics(),
              children: [for (final r in shown) _cell(r)],
            ),
          ),
        ]),
      ),
    );
  }

  Widget _tab(String label, IconData icon, bool faces) {
    final on = _faces == faces;
    return ChoiceChip(
      key: ValueKey('reaction-tab-${faces ? 'faces' : 'actions'}'),
      selected: on,
      showCheckmark: false,
      avatar: Icon(icon, size: 18, color: on ? AppColors.bgPrimary : AppColors.accentAmber),
      label: Text(label),
      labelStyle: AppTypography.labelBold.copyWith(color: on ? AppColors.bgPrimary : AppColors.textPrimary),
      selectedColor: AppColors.accentAmber,
      backgroundColor: AppColors.bgCard,
      onSelected: (_) => setState(() => _faces = faces),
    );
  }

  Widget _cell(BattleReaction r) => InkWell(
        key: ValueKey('reaction-${r.id}'),
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.pop(context, r.id),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          ReactionSprite(reactionId: r.id, size: _faces ? 84 : 64),
          const SizedBox(height: 4),
          Text(r.label,
              textAlign: TextAlign.center,
              maxLines: 2,
              style: AppTypography.bodySmall.copyWith(fontSize: 12, color: AppColors.textPrimary)),
        ]),
      );
}
