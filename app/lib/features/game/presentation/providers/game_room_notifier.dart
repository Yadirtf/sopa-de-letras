import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/game_repository.dart';
import '../../data/repositories/game_repository_impl.dart';
import 'game_room_state.dart';
import 'game_room_socket_listener.dart';
import 'word_attempt.dart';

final gameRepositoryProvider = Provider<GameRepository>((ref) {
  return GameRepositoryImpl();
});

final gameRoomNotifierProvider = StateNotifierProvider<GameRoomNotifier, GameRoomState>((ref) {
  return GameRoomNotifier(ref.watch(gameRepositoryProvider));
});

class GameRoomNotifier extends StateNotifier<GameRoomState> {
  final GameRepository _repository;
  final List<StreamSubscription> _subscriptions = [];
  String? _currentUserId;
  String? _joinedCode;

  GameRoomNotifier(this._repository) : super(const GameRoomState()) {
    _subscriptions.addAll(
      GameRoomSocketListener.bind(
        repository: _repository,
        getState: () => state,
        setState: (s) => state = s,
        currentUserId: () => _currentUserId,
      ),
    );
  }

  /// Quien juega en este telefono (tambien invitados sin cuenta).
  String? get currentUserId => _currentUserId;

  /// True si este telefono ya esta dentro (por socket) de la sala [code].
  bool isJoinedTo(String code) => _joinedCode == code.toUpperCase() && state.room?.code.toUpperCase() == _joinedCode;

  Future<void> createRoom({
    required String wordSearchId,
    int? maxPlayers,
    int? timeLimitSeconds,
    bool? isPrivate,
  }) async {
    _resetSession();
    state = state.copyWith(isLoading: true);
    try {
      final room = await _repository.createRoom(
          wordSearchId: wordSearchId, maxPlayers: maxPlayers, timeLimitSeconds: timeLimitSeconds, isPrivate: isPrivate);
      state = state.copyWith(isLoading: false, room: room);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  /// Carga la sala y entra por socket. Lo usan el invitado, las invitaciones y
  /// el anfitrion al abrir el lobby (antes el anfitrion nunca entraba y sus botones no hacian nada).
  Future<void> joinRoom({
    required String code,
    required String userId,
    required String username,
    String? avatarUrl,
  }) async {
    final upper = code.toUpperCase();
    if (state.room?.code.toUpperCase() != upper) _resetSession();
    _currentUserId = userId;
    state = state.copyWith(isLoading: true);
    try {
      final room = await _repository.getRoomByCode(upper);
      state = state.copyWith(room: room);
      final snapshot =
          await _repository.joinRoom(roomCode: upper, userId: userId, username: username, avatarUrl: avatarUrl);
      _joinedCode = upper;
      state = state.copyWith(
        isLoading: false,
        room: state.room!.copyWith(players: snapshot.players, hostUserId: snapshot.hostUserId),
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  void toggleReady(bool isReady) {
    final room = state.room;
    final me = _currentUserId;
    if (room == null || me == null) return;
    // Respuesta inmediata en pantalla; el servidor confirma con la lista oficial.
    state = state.copyWith(
      room: room.copyWith(
        players: [for (final p in room.players) p.userId == me ? p.copyWith(isReady: isReady) : p],
      ),
    );
    _repository.toggleReady(roomCode: room.code, userId: me, isReady: isReady);
  }

  void startGame() {
    if (state.room == null || _currentUserId == null || state.isStarting) return;
    state = state.copyWith(isStarting: true);
    _repository.startGame(roomCode: state.room!.code, userId: _currentUserId!);
  }

  /// Revisa el trazo en el telefono y, si es una palabra de la lista, la manda al servidor.
  WordAttemptOutcome submitSelection(String formed, List<int> start, List<int> end) {
    final room = state.room;
    final me = _currentUserId;
    if (room == null || me == null) return WordAttemptOutcome.notInList;
    final mine = room.players.where((p) => p.userId == me).expand((p) => p.wordsFound);
    final attempt = WordAttempt.evaluate(formed, room.words, mine);
    if (attempt.outcome != WordAttemptOutcome.sent) return attempt.outcome;
    _repository
        .submitWord(roomCode: room.code, userId: me, word: attempt.word!, startCoord: start, endCoord: end)
        .then((error) {
      if (error != null && mounted) state = state.copyWith(errorMessage: WordAttempt.friendlyRejection(error));
    });
    return WordAttemptOutcome.sent;
  }

  /// La animacion 3-2-1 termino: quitamos la capa y se puede jugar.
  void dismissCountdown() => state = state.copyWith(clearCountdown: true);

  void voteRematch() {
    if (state.room == null || _currentUserId == null) return;
    _repository.voteRematch(roomCode: state.room!.code, userId: _currentUserId!);
  }

  void leaveRoom() {
    if (state.room != null && _currentUserId != null) {
      _repository.leaveRoom(roomCode: state.room!.code, userId: _currentUserId!);
    }
    _resetSession();
  }

  /// Olvida la partida anterior (podio, marcadores...) para que no se cuele en la siguiente.
  void _resetSession() {
    _joinedCode = null;
    state = const GameRoomState();
  }

  @override
  void dispose() {
    for (final s in _subscriptions) {
      s.cancel();
    }
    _repository.disconnectSocket();
    super.dispose();
  }
}
