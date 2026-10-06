import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/game_room_entity.dart';

class RoomPlayerSlotWidget extends StatelessWidget {
  final RoomPlayerEntity? player;
  final int slotIndex;

  const RoomPlayerSlotWidget({
    super.key,
    required this.player,
    required this.slotIndex,
  });

  @override
  Widget build(BuildContext context) {
    if (player == null) {
      return Container(
        decoration: BoxDecoration(
          color: AppColors.bgSecondary.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderSubtle, style: BorderStyle.solid),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person_outline_rounded, color: AppColors.textMuted, size: 36),
            const SizedBox(height: 6),
            Text(
              'Libre',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      );
    }

    Color playerColor = AppColors.accentViolet;
    try {
      playerColor = Color(int.parse(player!.colorHex.replaceFirst('#', '0xFF')));
    } catch (_) {}

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: player!.isReady ? AppColors.accentEmerald : AppColors.borderSubtle,
          width: player!.isReady ? 2 : 1,
        ),
        boxShadow: player!.isReady
            ? [
                BoxShadow(
                  color: AppColors.accentEmerald.withValues(alpha: 0.25),
                  blurRadius: 10,
                ),
              ]
            : null,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: playerColor.withValues(alpha: 0.25),
                child: Text(
                  player!.username.isNotEmpty ? player!.username[0].toUpperCase() : '?',
                  style: AppTypography.heading2.copyWith(color: playerColor, fontSize: 22),
                ),
              ),
              if (player!.isHost)
                Positioned(
                  top: -8,
                  right: -8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.accentAmber,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.workspace_premium_rounded, size: 14, color: Colors.black),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              player!.username,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: player!.isReady ? AppColors.accentEmerald.withValues(alpha: 0.15) : AppColors.bgSecondary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              !player!.isConnected
                  ? 'Reconectando...'
                  : player!.isHost
                      ? 'Anfitrión'
                      : (player!.isReady ? 'Listo' : 'Esperando'),
              style: AppTypography.bodySmall.copyWith(
                fontSize: 10,
                color: player!.isReady ? AppColors.accentEmerald : AppColors.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
