import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../domain/entities/battle_catalog.dart';
import '../../providers/battle_match_notifier.dart';
import 'reaction_sprite.dart';

/// Botón de la barra superior: abre las reacciones para mandarle una al rival.
/// Tras mandar una espera un momento (igual que el servidor) para no hacer spam.
class ReactionButton extends ConsumerStatefulWidget {
  final String code;
  final BattleCatalog catalog;

  const ReactionButton({super.key, required this.code, required this.catalog});

  @override
  ConsumerState<ReactionButton> createState() => _ReactionButtonState();
}

class _ReactionButtonState extends ConsumerState<ReactionButton> {
  static const _cooldown = Duration(milliseconds: 1600);
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
      icon: Icon(Icons.campaign_rounded, color: ready ? AppColors.accentAmber : AppColors.textMuted),
    );
  }
}

class _Tray extends StatelessWidget {
  final List<BattleReaction> reactions;
  const _Tray({required this.reactions});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 16, 12, 8),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Mándale una reacción a tu rival', style: AppTypography.titleMedium),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true,
            crossAxisCount: 4,
            childAspectRatio: 0.82,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              for (final r in reactions)
                InkWell(
                  key: ValueKey('reaction-${r.id}'),
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => Navigator.pop(context, r.id),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    ReactionSprite(reactionId: r.id, size: 64),
                    const SizedBox(height: 4),
                    Text(r.label,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        style: AppTypography.bodySmall.copyWith(fontSize: 12, color: AppColors.textPrimary)),
                  ]),
                ),
            ],
          ),
        ]),
      ),
    );
  }
}
