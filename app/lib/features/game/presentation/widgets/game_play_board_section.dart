import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/game_room_entity.dart';
import '../helpers/player_color.dart';
import '../providers/game_board_provider.dart';
import '../providers/game_room_state.dart';
import '../providers/race_standings.dart';
import 'connection_lost_banner.dart';
import 'forming_word_bar.dart';
import 'opponents_race_strip_widget.dart';
import 'target_words_list_widget.dart';
import 'word_search_canvas_widget.dart';
import 'word_search_painter.dart';

/// Todo lo que se ve durante la partida, de arriba a abajo en orden de importancia
/// para el ojo: la carrera (de reojo), las palabras (referencia) y el tablero,
/// que se queda con todo el espacio restante para que las letras sean grandes.
///
/// No hay scroll vertical: antes el tablero vivia dentro de un scroll que le
/// robaba los arrastres verticales y diagonales.
class GamePlayBoardSection extends StatelessWidget {
  final GameRoomState state;
  final String? currentUserId;
  final WordTraced onWordTraced;

  const GamePlayBoardSection({
    super.key,
    required this.state,
    required this.currentUserId,
    required this.onWordTraced,
  });

  List<FoundStroke> _foundStrokes() => [
        for (final claim in state.claimedWords.values)
          if (claim.start != null && claim.end != null)
            FoundStroke(
              CellCoord(claim.start![0], claim.start![1]),
              CellCoord(claim.end![0], claim.end![1]),
              playerColor(claim.colorHex),
            ),
      ];

  @override
  Widget build(BuildContext context) {
    final room = state.room!;
    final standings = computeRaceStandings(room.players, currentUserId, state.leaderboard);
    final myWords = standings.where((s) => s.isMe).map((s) => s.wordsCount).firstOrNull ?? 0;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ConnectionLostBanner(visible: !state.isConnected),
          OpponentsRaceStripWidget(standings: standings, totalWords: room.words.length),
          const SizedBox(height: 10),
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 112),
            child: SingleChildScrollView(
              child: TargetWordsListWidget(words: room.words, claimedWords: state.claimedWords),
            ),
          ),
          const SizedBox(height: 6),
          FormingWordBar(pendingWords: [
            for (final w in room.words)
              if (!state.claimedWords.containsKey(w.toUpperCase())) w,
          ]),
          const SizedBox(height: 6),
          Expanded(
            child: WordSearchCanvasWidget(
              grid: room.grid,
              found: _foundStrokes(),
              enabled: state.countdownValue == null && (state.isGameActive || room.status == RoomStatusEnum.inProgress),
              onWordTraced: onWordTraced,
            ),
          ),
          if (myWords == 0 && state.isGameActive)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.swipe_rounded, size: 18, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      'Desliza el dedo de la primera a la última letra',
                      textAlign: TextAlign.center,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
