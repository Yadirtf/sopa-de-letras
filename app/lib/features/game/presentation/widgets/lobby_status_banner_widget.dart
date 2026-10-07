import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/room_lobby_entities.dart';

/// Explica en una frase que esta pasando en la sala y que hace falta para empezar.
class LobbyStatusBannerWidget extends StatelessWidget {
  final LobbyReadiness readiness;

  const LobbyStatusBannerWidget({super.key, required this.readiness});

  @override
  Widget build(BuildContext context) {
    final allReady = readiness.everyoneReady;
    final color = allReady ? AppColors.accentEmerald : AppColors.accentAmber;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(allReady ? Icons.celebration_rounded : Icons.groups_rounded, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Listos: ${readiness.readyCount} de ${readiness.totalPlayers}',
                  style: AppTypography.labelLarge.copyWith(color: color),
                ),
                const SizedBox(height: 2),
                Text(_hint(), style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _hint() {
    if (readiness.everyoneReady) {
      if (readiness.isHost) {
        return readiness.totalPlayers == 1
            ? 'Puedes jugar solo o invitar a tus amigos.'
            : '¡Todos listos! Pulsa Iniciar cuando quieras.';
      }
      return '¡Todos listos! ${readiness.hostName} va a iniciar la partida.';
    }
    if (!readiness.isHost && !readiness.isReady) return 'Pulsa el botón de abajo cuando estés listo.';
    return 'Esperando a: ${readiness.pendingNames.join(', ')}';
  }
}
