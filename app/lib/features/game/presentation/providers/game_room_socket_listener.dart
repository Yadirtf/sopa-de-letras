import 'dart:async';
import '../../domain/repositories/game_repository.dart';
import '../../domain/entities/game_event_entities.dart';
import '../../domain/entities/game_room_entity.dart';
import 'game_room_state.dart';

class GameRoomSocketListener {
  static List<StreamSubscription> bind({
    required GameRepository repository,
    required GameRoomState Function() getState,
    required void Function(GameRoomState) setState,
    required String? Function() currentUserId,
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

      // La cuenta 3-2-1 la cierra su propia animacion (dismissCountdown), no este evento:
      // si no, el "¡A buscar!" desaparecia antes de verse.
      repository.onGameStarted().listen((data) => update((s) {
            final grid = _parseGrid(data['grid']);
            final words = _parseWords(data['words']);
            return s.copyWith(
              isGameActive: true,
              gameStartedAt: DateTime.now(),
              claimedWords: const {},
              leaderboard: const [],
              room: s.room?.copyWith(
                status: RoomStatusEnum.inProgress,
                grid: grid.isNotEmpty ? grid : null,
                words: words.isNotEmpty ? words : null,
              ),
            );
          })),

      // Mi sopa es privada: solo pinto lo que encontre yo. Del oponente solo se ve
      // cuantas lleva (marcador), nunca cuales ni donde.
      repository.onWordFound().where((e) => e.claimedByUserId == currentUserId()).listen((event) => update((s) {
            final claimed = Map.of(s.claimedWords)..putIfAbsent(event.word.toUpperCase(), () => event);
            return s.copyWith(
              claimedWords: claimed,
              latestWordFound: event,
              room: event.pointsAwarded > 0 ? _withPoints(s.room, event) : s.room,
            );
          })),

      repository.onConnectionChanged().listen((online) => update((s) => s.copyWith(isConnected: online))),

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

  /// Suma la palabra al jugador que la encontro: con esto se mueve la carrera de oponentes.
  static GameRoomEntity? _withPoints(GameRoomEntity? room, WordFoundEventEntity event) {
    if (room == null) return null;
    return room.copyWith(players: [
      for (final p in room.players)
        if (p.userId == event.claimedByUserId && !p.wordsFound.contains(event.word.toUpperCase()))
          p.copyWith(score: event.newScore, wordsFound: [...p.wordsFound, event.word.toUpperCase()])
        else
          p,
    ]);
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
