import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/game_room_notifier.dart';
import '../providers/game_room_state.dart';
import '../providers/word_attempt.dart';
import '../providers/game_board_provider.dart';
import '../widgets/arcade_countdown_overlay.dart';
import '../widgets/game_play_board_section.dart';
import '../widgets/game_timer_chip.dart';
import '../widgets/leave_room_dialog.dart';

class GamePlayPage extends ConsumerStatefulWidget {
  final String roomCode;

  const GamePlayPage({super.key, required this.roomCode});

  @override
  ConsumerState<GamePlayPage> createState() => _GamePlayPageState();
}

class _GamePlayPageState extends ConsumerState<GamePlayPage> {
  bool _leaving = false;

  GameRoomNotifier get _notifier => ref.read(gameRoomNotifierProvider.notifier);

  /// Salir es siempre una decision del jugador: perder el internet nunca lo saca.
  Future<void> _confirmLeave() async {
    if (_leaving) return;
    final leave = await LeaveRoomDialog.confirm(context, inGame: true);
    if (!leave || !mounted) return;
    _leaving = true;
    _notifier.leaveRoom();
    context.go('/catalog');
  }

  void _toast(String text, Color color) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        behavior: SnackBarBehavior.floating,
        duration: const Duration(milliseconds: 1400),
        backgroundColor: color,
        content: Text(text, style: AppTypography.labelLarge.copyWith(color: Colors.white)),
      ));
  }

  bool _onWordTraced(String word, CellCoord start, CellCoord end) {
    final outcome = _notifier.submitSelection(word, [start.row, start.col], [end.row, end.col]);
    if (outcome == WordAttemptOutcome.alreadyMine) _toast('Ya encontraste esa palabra', AppColors.accentCyan);
    return outcome == WordAttemptOutcome.sent;
  }

  void _onStateChanged(GameRoomState? previous, GameRoomState next) {
    if (next.podium.isNotEmpty && !next.isGameActive) {
      context.go('/game-podium/${widget.roomCode}');
      return;
    }
    final found = next.latestWordFound;
    if (found != null && found != previous?.latestWordFound && found.pointsAwarded > 0) {
      final mine = found.claimedByUserId == _notifier.currentUserId;
      _toast(
        mine
            ? '¡Encontraste ${found.word}! +${found.pointsAwarded}'
            : '${found.claimedByUsername} encontró ${found.word}',
        mine ? AppColors.accentEmerald : AppColors.bgCard,
      );
    }
    if (next.errorMessage != null && next.errorMessage != previous?.errorMessage) {
      _toast(next.errorMessage!, AppColors.accentRose);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(gameRoomNotifierProvider);
    final room = state.room;
    ref.listen<GameRoomState>(gameRoomNotifierProvider, _onStateChanged);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _confirmLeave();
      },
      child: Scaffold(
        backgroundColor: AppColors.bgPrimary,
        appBar: AppBar(
          backgroundColor: AppColors.bgPrimary,
          elevation: 0,
          automaticallyImplyLeading: false,
          titleSpacing: 16,
          title: Text(
            room?.wordSearchTitle ?? 'Partida',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.heading2.copyWith(fontSize: 18),
          ),
          actions: [
            GameTimerChip(startedAt: state.gameStartedAt, timeLimitSeconds: room?.timeLimitSeconds),
            const SizedBox(width: 4),
            TextButton.icon(
              key: const ValueKey('game-leave-button'),
              onPressed: _confirmLeave,
              icon: const Icon(Icons.logout_rounded, color: AppColors.accentRose, size: 20),
              label: Text('Abandonar', style: AppTypography.labelLarge.copyWith(color: AppColors.accentRose)),
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: room == null
            ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
            : Stack(
                children: [
                  SafeArea(
                    child: GamePlayBoardSection(
                      state: state,
                      currentUserId: _notifier.currentUserId,
                      onWordTraced: _onWordTraced,
                    ),
                  ),
                  if (state.countdownValue != null)
                    Positioned.fill(
                      child: ArcadeCountdownOverlay(
                        seconds: state.countdownValue!,
                        onFinished: _notifier.dismissCountdown,
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}
