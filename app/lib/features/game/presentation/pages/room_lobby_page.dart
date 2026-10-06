import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/providers/auth_notifier.dart';
import '../providers/game_room_notifier.dart';
import '../widgets/room_player_slot_widget.dart';
import '../../../social/presentation/widgets/invite_friends_sheet.dart';

class RoomLobbyPage extends ConsumerWidget {
  final String roomCode;

  const RoomLobbyPage({super.key, required this.roomCode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(gameRoomNotifierProvider);
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    final room = state.room;
    final currentUserId = ref.watch(authNotifierProvider).user?.id;

    ref.listen(gameRoomNotifierProvider, (previous, next) {
      if (next.countdownValue != null || next.isGameActive) {
        context.go('/game/$roomCode');
      }
    });

    final isHost = room != null && room.hostUserId == currentUserId;
    final me = room?.players.where((p) => p.userId == currentUserId).firstOrNull;
    final isReady = me?.isReady ?? false;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Lobby • $roomCode', style: AppTypography.heading2.copyWith(fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app_rounded, color: AppColors.accentRose),
            onPressed: () {
              if (currentUserId != null) {
                notifier.leaveRoom();
              }
              context.go('/catalog');
            },
          ),
        ],
      ),
      body: room == null
          ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
          : Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(room.wordSearchTitle, style: AppTypography.heading2.copyWith(fontSize: 20)),
                  const SizedBox(height: 4),
                  Text(
                    'Jugadores conectados (${room.players.length}/${room.maxPlayers})',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 1.1,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: room.maxPlayers,
                      itemBuilder: (context, index) {
                        final player = index < room.players.length ? room.players[index] : null;
                        return RoomPlayerSlotWidget(player: player, slotIndex: index);
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (room.players.length < room.maxPlayers)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: TextButton.icon(
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.accentAmber,
                          minimumSize: const Size.fromHeight(48),
                          backgroundColor: AppColors.accentAmber.withValues(alpha: 0.1),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () => InviteFriendsSheet.show(context, room.code),
                        icon: const Icon(Icons.person_add_alt_1_rounded),
                        label: Text('Invitar amigos', style: AppTypography.labelLarge.copyWith(color: AppColors.accentAmber)),
                      ),
                    ),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: isReady ? AppColors.accentEmerald : AppColors.accentCyan,
                              width: 2,
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () => notifier.toggleReady(!isReady),
                          child: Text(
                            isReady ? '¡Listo! (Cancelar)' : 'Marcar como Listo',
                            style: AppTypography.labelLarge.copyWith(
                              color: isReady ? AppColors.accentEmerald : AppColors.accentCyan,
                            ),
                          ),
                        ),
                      ),
                      if (isHost) ...[
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accentViolet,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: () => notifier.startGame(),
                            child: Text(
                              'Iniciar Juego',
                              style: AppTypography.labelLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}
