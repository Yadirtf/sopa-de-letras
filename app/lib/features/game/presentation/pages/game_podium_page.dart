import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/game_room_entity.dart';
import '../providers/game_room_notifier.dart';
import '../widgets/podium/celebration_background.dart';
import '../widgets/podium/podium_actions.dart';
import '../widgets/podium/podium_headline.dart';
import '../widgets/podium/podium_rest_list.dart';
import '../widgets/podium/podium_stand.dart';
import '../widgets/podium/podium_summary.dart';

/// Final de la partida: titular dorado, podio con los avatares, el resumen de
/// quien mira y los botones de revancha o salida, sobre un fondo de ganador.
class GamePodiumPage extends ConsumerWidget {
  final String roomCode;

  const GamePodiumPage({super.key, required this.roomCode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(gameRoomNotifierProvider);
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    final summary = PodiumSummary(
      podium: state.podium,
      currentUserId: notifier.currentUserId,
      totalWords: state.room?.words.length ?? 0,
    );
    final me = summary.me;

    ref.listen(gameRoomNotifierProvider, (previous, next) {
      if (next.isGameActive || next.countdownValue != null) context.go('/game/$roomCode');
      if (next.room?.status == RoomStatusEnum.waiting && next.podium.isEmpty) context.go('/lobby/$roomCode');
    });

    return Scaffold(
      body: CelebrationBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 8),
                        PodiumHeadline(summary: summary),
                        const SizedBox(height: 44),
                        if (state.podium.isNotEmpty) PodiumStand(podium: state.podium, currentUserId: notifier.currentUserId),
                        const SizedBox(height: 18),
                        if (me != null) PodiumMyResultCard(me: me),
                        if (summary.rest.isNotEmpty) ...[
                          const SizedBox(height: 14),
                          PodiumRestList(entries: summary.rest, currentUserId: notifier.currentUserId),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                PodiumActions(
                  solo: summary.isSolo,
                  rematch: state.rematchState,
                  onRematch: notifier.voteRematch,
                  onExit: () {
                    // Salir de la sala devuelve al jugador a "En línea" para sus amigos (EP-05).
                    notifier.leaveRoom();
                    context.go('/home');
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
