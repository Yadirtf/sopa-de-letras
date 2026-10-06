import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/game_room_notifier.dart';
import '../widgets/live_race_bar_widget.dart';
import '../widgets/target_words_list_widget.dart';
import '../widgets/word_search_canvas_widget.dart';
import '../widgets/arcade_countdown_overlay.dart';

class GamePlayPage extends ConsumerWidget {
  final String roomCode;

  const GamePlayPage({super.key, required this.roomCode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(gameRoomNotifierProvider);
    final notifier = ref.read(gameRoomNotifierProvider.notifier);
    final room = state.room;

    ref.listen(gameRoomNotifierProvider, (previous, next) {
      if (next.podium.isNotEmpty && !next.isGameActive) {
        context.go('/game-podium/$roomCode');
      }
    });

    if (room == null) {
      return const Scaffold(
        backgroundColor: AppColors.bgPrimary,
        body: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text(room.wordSearchTitle, style: AppTypography.heading2.copyWith(fontSize: 18)),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, size: 16, color: AppColors.accentRose),
                const SizedBox(width: 4),
                Text('Realtime', style: AppTypography.bodySmall.copyWith(color: AppColors.accentRose)),
              ],
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  LiveRaceBarWidget(leaderboard: state.leaderboard),
                  const SizedBox(height: 12),
                  TargetWordsListWidget(
                    words: room.words,
                    claimedWords: state.claimedWords,
                  ),
                  const SizedBox(height: 16),
                  WordSearchCanvasWidget(
                    grid: room.grid,
                    onWordCompleted: (word, start, end) {
                      notifier.submitWord(
                        word,
                        [start.row, start.col],
                        [end.row, end.col],
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
          if (state.countdownValue != null)
            ArcadeCountdownOverlay(count: state.countdownValue!),
        ],
      ),
    );
  }
}
