import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/icon_label.dart';
import '../../domain/entities/game_room_entity.dart';
import '../providers/game_room_notifier.dart';

class GamePodiumPage extends ConsumerWidget {
  final String roomCode;

  const GamePodiumPage({super.key, required this.roomCode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(gameRoomNotifierProvider);
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    final podium = state.podium;
    final rematch = state.rematchState;

    ref.listen(gameRoomNotifierProvider, (previous, next) {
      if (next.isGameActive || next.countdownValue != null) context.go('/game/$roomCode');
      if (next.room?.status == RoomStatusEnum.waiting && next.podium.isEmpty) context.go('/lobby/$roomCode');
    });

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              IconLabel(
                icon: Icons.emoji_events_rounded, text: 'Podio Final',
                alignment: MainAxisAlignment.center,
                style: AppTypography.heading1.copyWith(fontSize: 26, color: AppColors.accentAmber),
              ),
              const SizedBox(height: 20),
              if (podium.isNotEmpty) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (podium.length > 1) _buildPedestal(podium[1], 2, 90, AppColors.accentCyan),
                    const SizedBox(width: 8),
                    _buildPedestal(podium[0], 1, 120, AppColors.accentAmber),
                    const SizedBox(width: 8),
                    if (podium.length > 2) _buildPedestal(podium[2], 3, 75, AppColors.accentViolet),
                  ],
                ),
              ],
              const SizedBox(height: 24),
              Expanded(
                child: ListView.builder(
                  itemCount: podium.length,
                  itemBuilder: (context, index) {
                    final item = podium[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Row(
                        children: [
                          Text('#${item.rank}', style: AppTypography.heading2.copyWith(fontSize: 16)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(item.username, style: AppTypography.labelLarge),
                          ),
                          Text('${item.score} pts', style: AppTypography.labelLarge.copyWith(color: AppColors.accentCyan)),
                          const SizedBox(width: 12),
                          IconLabel(
                            icon: Icons.emoji_events_rounded,
                            text: '+${item.trophiesEarned}',
                            style: AppTypography.labelLarge.copyWith(color: AppColors.accentAmber),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentEmerald,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.replay_rounded, color: Colors.white),
                label: Text(
                  rematch != null
                      ? 'Revancha (${rematch.votesCount}/${rematch.totalPlayers})'
                      : '¡Revancha Rápida!',
                  style: AppTypography.labelLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                onPressed: () => notifier.voteRematch(),
              ),
              const SizedBox(height: 10),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.borderSubtle),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  // Salir de la sala devuelve al jugador a "En línea" para sus amigos (EP-05).
                  notifier.leaveRoom();
                  context.go('/catalog');
                },
                child: Text('Salir al Catálogo', style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPedestal(dynamic entry, int place, double height, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(entry.username, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Container(
          width: 80,
          height: height,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.25),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            border: Border.all(color: color, width: 2),
          ),
          child: Center(
            child: Text(
              '$placeº',
              style: AppTypography.heading1.copyWith(color: color, fontSize: 24),
            ),
          ),
        ),
      ],
    );
  }
}
