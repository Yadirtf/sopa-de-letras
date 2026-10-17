import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_links.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../social/domain/entities/room_invite_entity.dart';
import '../../../social/presentation/widgets/invite_friends_sheet.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_view.dart';
import '../art/battle_art_images.dart';

/// Sala esperando al rival: el código grande para dictarlo y el enlace para compartirlo.
class BattleWaitingView extends StatelessWidget {
  final BattleView view;
  final BattleCatalog catalog;

  const BattleWaitingView({super.key, required this.view, required this.catalog});

  void _copy(BuildContext context, String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final config = view.config;
    final terrain = catalog.terrain(config.terrainId);
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        TerrainBanner(terrainId: terrain.id, unitIds: [for (final u in terrain.units.reversed.take(3)) u.id]),
        const SizedBox(height: 16),
        Text('Esperando a tu rival…',
            textAlign: TextAlign.center, style: AppTypography.titleLarge.copyWith(fontSize: 22)),
        const SizedBox(height: 6),
        Text(
          'Reta a un amigo en línea o pásale el código. La batalla empieza sola cuando entre.',
          textAlign: TextAlign.center,
          style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 20),
        Center(
          child: SelectableText(
            view.code,
            key: const ValueKey('battle-room-code'),
            style: AppTypography.pinDisplay.copyWith(fontSize: 40, letterSpacing: 8, color: AppColors.accentAmber),
          ),
        ),
        const SizedBox(height: 16),
        Wrap(alignment: WrapAlignment.center, spacing: 10, runSpacing: 10, children: [
          OutlinedButton.icon(
            onPressed: () => _copy(context, view.code, 'Código copiado'),
            icon: const Icon(Icons.copy_rounded),
            label: const Text('Copiar código'),
          ),
          OutlinedButton.icon(
            onPressed: () => _copy(context, AppLinks.battleInvite(view.code), 'Enlace copiado: pégalo donde quieras'),
            icon: const Icon(Icons.link_rounded),
            label: const Text('Copiar enlace'),
          ),
        ]),
        const SizedBox(height: 12),
        FilledButton.icon(
          key: const ValueKey('battle-invite-friends'),
          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(50), backgroundColor: AppColors.accentAmber),
          onPressed: () => InviteFriendsSheet.show(context, view.code, game: RoomInviteEntity.battle),
          icon: const Icon(Icons.groups_rounded),
          label: const Text('Retar a un amigo en línea'),
        ),
        const SizedBox(height: 24),
        Wrap(alignment: WrapAlignment.center, spacing: 8, runSpacing: 8, children: [
          _chip(Icons.grid_on_rounded, 'Arena ${config.cols} × ${config.rows}'),
          _chip(Icons.terrain_rounded, terrain.name),
          _chip(Icons.shield_rounded, '${config.unitCount} figuras'),
          _chip(config.allowsTap ? Icons.touch_app_rounded : Icons.keyboard_rounded,
              config.allowsTap ? 'Tocar o escribir' : 'Solo escribir'),
        ]),
      ],
    );
  }

  Widget _chip(IconData icon, String text) => Chip(
        avatar: Icon(icon, size: 18, color: AppColors.accentAmber),
        label: Text(text, style: AppTypography.labelBold.copyWith(fontSize: 13)),
        backgroundColor: AppColors.bgCard,
      );
}
