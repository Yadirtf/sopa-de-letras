import 'dart:async';
import '../../domain/repositories/game_repository.dart';
import '../../domain/entities/game_room_entity.dart';
import 'game_room_state.dart';

class GameRoomSocketListener {
  static List<StreamSubscription> bind({
    required GameRepository repository,
    required GameRoomState Function() getState,
    required void Function(GameRoomState) setState,
  }) {
    void update(GameRoomState Function(GameRoomState s) change) => setState(change(getState()));

    return [
      // Entra, sale o cambia "listo": el servidor manda la lista completa y la copiamos tal cual.
      repository.onPlayersChanged().listen((snapshot) => update((s) {
            if (s.room == null) return s;
            return s.copyWith(
              room: s.room!.copyWith(players: snapshot.players, hostUserId: snapshot.hostUserId),
            );
          })),

      repository.onRoomError().listen((error) => update(
            (s) => s.copyWith(errorMessage: error.message, isStarting: false),
          )),

      repository.onGameCountdown().listen((data) => update((s) => s.copyWith(
            isStarting: false,
            countdownValue: (data['countdownSeconds'] as num?)?.toInt() ?? 3,
            room: s.room?.copyWith(status: RoomStatusEnum.countdown),
          ))),

      repository.onGameStarted().listen((data) => update((s) {
            final grid = _parseGrid(data['grid']);
            final words = _parseWords(data['words']);
            return s.copyWith(
              clearCountdown: true,
              isGameActive: true,
              room: s.room?.copyWith(
                status: RoomStatusEnum.inProgress,
                grid: grid.isNotEmpty ? grid : null,
                words: words.isNotEmpty ? words : null,
              ),
            );
          })),

      repository.onWordFound().listen((event) => update((s) {
            final updated = Map.of(s.claimedWords)..[event.word.toUpperCase()] = event;
            return s.copyWith(claimedWords: updated, latestWordFound: event);
          })),

      repository.onLeaderboardUpdated().listen((entries) => update((s) => s.copyWith(leaderboard: entries))),

      repository.onGameEnded().listen((podium) => update((s) => s.copyWith(isGameActive: false, podium: podium))),

      repository.onRematchUpdate().listen((rematch) => update((s) => s.copyWith(rematchState: rematch))),

      // Revancha aceptada: volvemos al lobby con tablero nuevo y marcadores a cero.
      repository.onRematchStarted().listen((data) => update((s) {
            if (s.room == null) return s;
            // Los jugadores (puntos a cero, listos reiniciados) llegan justo despues por onPlayersChanged.
            final grid = _parseGrid(data['grid']);
            final words = _parseWords(data['words']);
            return GameRoomState(
              room: s.room!.copyWith(
                status: RoomStatusEnum.waiting,
                grid: grid.isNotEmpty ? grid : null,
                words: words.isNotEmpty ? words : null,
              ),
            );
          })),
    ];
  }

  static List<List<String>> _parseGrid(dynamic raw) {
    if (raw is! List) return [];
    return raw.map((r) => (r as List).map((c) => c.toString()).toList()).toList();
  }

  static List<String> _parseWords(dynamic raw) {
    if (raw is! List) return [];
    return raw.map((w) => w.toString()).toList();
  }
}
