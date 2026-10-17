import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/theme/app_typography.dart';
import '../../../../../core/widgets/avatar_view.dart';
import '../../../domain/entities/battle_view.dart';

/// Marcador: tú contra tu rival, con figuras vivas y puntos. Brilla quien tiene el turno.
class BattleScoreboard extends StatelessWidget {
  final BattleView view;

  const BattleScoreboard({super.key, required this.view});

  @override
  Widget build(BuildContext context) {
    final me = view.me;
    final enemy = view.enemy;
    return Row(children: [
      Expanded(child: _side(me, 'Tú', active: view.turnUserId == me?.userId)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Text('VS', style: AppTypography.titleMedium.copyWith(color: AppColors.accentAmber)),
      ),
      Expanded(
          child: _side(enemy, enemy?.username ?? 'Rival', active: view.turnUserId == enemy?.userId, alignEnd: true)),
    ]);
  }

  Widget _side(BattlePlayerInfo? p, String name, {required bool active, bool alignEnd = false}) {
    final avatar = p?.isBot == true
        ? const CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.accentAmber,
            child: Icon(Icons.smart_toy_rounded, color: AppColors.bgPrimary, size: 22))
        : AvatarView(avatarId: p?.avatarUrl, size: 36);
    final info = Column(
      crossAxisAlignment: alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.labelBold),
        Text(
          '${p?.unitsAlive ?? 0}/${p?.unitsTotal ?? 0} figuras · ${p?.score ?? 0} pts',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: active ? AppColors.accentAmber : Colors.transparent, width: 2),
      ),
      child: Row(
        mainAxisAlignment: alignEnd ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: alignEnd
            ? [Flexible(child: info), const SizedBox(width: 8), avatar]
            : [avatar, const SizedBox(width: 8), Flexible(child: info)],
      ),
    );
  }
}
