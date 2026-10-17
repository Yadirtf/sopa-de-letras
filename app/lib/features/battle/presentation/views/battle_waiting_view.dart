import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_links.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_view.dart';

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
        Text(terrain.emoji, textAlign: TextAlign.center, style: const TextStyle(fontSize: 56)),
        const SizedBox(height: 8),
        Text('Esperando a tu rival…',
            textAlign: TextAlign.center, style: AppTypography.titleLarge.copyWith(fontSize: 22)),
        const SizedBox(height: 6),
        Text(
          'Pásale este código o el enlace. La batalla empieza sola cuando entre.',
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
          FilledButton.icon(
            onPressed: () => _copy(context, AppLinks.battleInvite(view.code), 'Enlace copiado: pégalo donde quieras'),
            icon: const Icon(Icons.link_rounded),
            label: const Text('Copiar invitación'),
          ),
        ]),
        const SizedBox(height: 24),
        Wrap(alignment: WrapAlignment.center, spacing: 8, runSpacing: 8, children: [
          _chip('🗺️', 'Arena ${config.cols} × ${config.rows}'),
          _chip(terrain.emoji, terrain.name),
          _chip('🪖', '${config.unitCount} figuras'),
          _chip(config.allowsTap ? '👆' : '⌨️', config.allowsTap ? 'Tocar o escribir' : 'Solo escribir'),
        ]),
      ],
    );
  }

  Widget _chip(String emoji, String text) => Chip(
        avatar: Text(emoji),
        label: Text(text, style: AppTypography.labelBold.copyWith(fontSize: 13)),
        backgroundColor: AppColors.bgCard,
      );
}
