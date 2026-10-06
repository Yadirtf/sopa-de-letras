import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/room_lobby_entities.dart';

/// Un solo boton grande segun quien mira: el anfitrion inicia, los demas avisan que estan listos.
/// Botones grandes, un icono y un texto que dice lo que pasa: pensado para todas las edades.
class LobbyActionBarWidget extends StatelessWidget {
  final LobbyReadiness readiness;
  final bool isStarting;
  final ValueChanged<bool> onToggleReady;
  final VoidCallback onStart;

  const LobbyActionBarWidget({
    super.key,
    required this.readiness,
    required this.isStarting,
    required this.onToggleReady,
    required this.onStart,
  });

  @override
  Widget build(BuildContext context) {
    return readiness.isHost ? _buildHostButton() : _buildReadyButton();
  }

  Widget _buildHostButton() {
    final canStart = readiness.everyoneReady && !isStarting;
    final waiting = readiness.pendingNames.length;
    final label = isStarting
        ? 'Iniciando...'
        : canStart
            ? (readiness.totalPlayers == 1 ? 'Jugar solo' : '¡Iniciar partida!')
            : 'Esperando a $waiting ${waiting == 1 ? 'jugador' : 'jugadores'}';

    return ElevatedButton.icon(
      key: const ValueKey('lobby-start-button'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accentViolet,
        disabledBackgroundColor: AppColors.bgCard,
        minimumSize: const Size.fromHeight(60),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
      onPressed: canStart ? onStart : null,
      icon: isStarting
          ? const SizedBox(
              width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
          : Icon(canStart ? Icons.play_arrow_rounded : Icons.hourglass_top_rounded,
              color: canStart ? Colors.white : AppColors.textSecondary, size: 28),
      label: Text(
        label,
        style: AppTypography.labelLarge.copyWith(
          fontSize: 17,
          color: canStart || isStarting ? Colors.white : AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildReadyButton() {
    final ready = readiness.isReady;
    final color = ready ? AppColors.accentEmerald : AppColors.accentCyan;

    return ElevatedButton.icon(
      key: const ValueKey('lobby-ready-button'),
      style: ElevatedButton.styleFrom(
        backgroundColor: ready ? AppColors.accentEmerald.withValues(alpha: 0.15) : AppColors.accentCyan,
        minimumSize: const Size.fromHeight(60),
        side: BorderSide(color: color, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
      onPressed: () => onToggleReady(!ready),
      icon: Icon(ready ? Icons.check_circle_rounded : Icons.thumb_up_alt_rounded,
          color: ready ? AppColors.accentEmerald : Colors.black, size: 26),
      label: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            ready ? '¡Estoy listo!' : 'Toca cuando estés listo',
            style:
                AppTypography.labelLarge.copyWith(fontSize: 17, color: ready ? AppColors.accentEmerald : Colors.black),
          ),
          if (ready)
            Text('Toca otra vez si aún no lo estás',
                style: AppTypography.bodySmall.copyWith(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
