import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/avatar_view.dart';
import '../../domain/entities/game_room_entity.dart';
import '../helpers/player_color.dart';

/// Puesto de un jugador en el lobby: su avatar elegido, su nombre y si esta listo.
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
    final p = player;
    if (p == null) return const _EmptySlot();

    final color = playerColor(p.colorHex);
    final ready = p.isReady || p.isHost;
    final status = !p.isConnected
        ? 'Reconectando...'
        : p.isHost
            ? 'Creó la sala'
            : (p.isReady ? 'Listo' : 'Esperando');
    final statusColor = !p.isConnected ? AppColors.accentAmber : (ready ? AppColors.accentEmerald : AppColors.textMuted);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: ready ? AppColors.accentEmerald : AppColors.borderSubtle,
          width: ready ? 2 : 1,
        ),
        boxShadow: ready ? [BoxShadow(color: AppColors.accentEmerald.withValues(alpha: 0.25), blurRadius: 10)] : null,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: color, width: 2)),
                child: Opacity(
                  opacity: p.isConnected ? 1 : 0.45,
                  child: AvatarView(key: ValueKey('slot-avatar-${p.userId}'), avatarId: p.avatarUrl, size: 54),
                ),
              ),
              if (p.isHost)
                const Positioned(
                  top: -6,
                  right: -6,
                  child: CircleAvatar(
                    radius: 12,
                    backgroundColor: AppColors.accentAmber,
                    child: Icon(Icons.workspace_premium_rounded, size: 15, color: Colors.black),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              p.username,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              status,
              style: AppTypography.bodySmall.copyWith(fontSize: 10, color: statusColor, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptySlot extends StatelessWidget {
  const _EmptySlot();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.person_outline_rounded, color: AppColors.textMuted, size: 36),
          const SizedBox(height: 6),
          Text('Libre', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
