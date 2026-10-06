import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/game_repository.dart';
import '../../data/repositories/game_repository_impl.dart';
import 'game_room_state.dart';
import 'game_room_socket_listener.dart';

final gameRepositoryProvider = Provider<GameRepository>((ref) {
  return GameRepositoryImpl();
});

final gameRoomNotifierProvider =
    StateNotifierProvider<GameRoomNotifier, GameRoomState>((ref) {
  return GameRoomNotifier(ref.watch(gameRepositoryProvider));
});

class GameRoomNotifier extends StateNotifier<GameRoomState> {
  final GameRepository _repository;
  final List<StreamSubscription> _subscriptions = [];
  String? _currentUserId;

  GameRoomNotifier(this._repository) : super(const GameRoomState()) {
    _subscriptions.addAll(
      GameRoomSocketListener.bind(
        repository: _repository,
        getState: () => state,
        setState: (s) => state = s,
      ),
    );
  }

  Future<void> createRoom({
    required String wordSearchId,
    int? maxPlayers,
    int? timeLimitSeconds,
    bool? isPrivate,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final room = await _repository.createRoom(
        wordSearchId: wordSearchId,
        maxPlayers: maxPlayers,
        timeLimitSeconds: timeLimitSeconds,
        isPrivate: isPrivate,
      );
      state = state.copyWith(isLoading: false, room: room);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> joinRoom({
    required String code,
    required String userId,
    required String username,
    String? avatarUrl,
  }) async {
    _currentUserId = userId;
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final room = await _repository.getRoomByCode(code);
      state = state.copyWith(isLoading: false, room: room);
      _repository.joinRoom(
        roomCode: code,
        userId: userId,
        username: username,
        avatarUrl: avatarUrl,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  void toggleReady(bool isReady) {
    if (state.room == null || _currentUserId == null) return;
    _repository.toggleReady(
      roomCode: state.room!.code,
      userId: _currentUserId!,
      isReady: isReady,
    );
  }

  void startGame() {
    if (state.room == null || _currentUserId == null) return;
    _repository.startGame(roomCode: state.room!.code, userId: _currentUserId!);
  }

  void submitWord(String word, List<int> start, List<int> end) {
    if (state.room == null || _currentUserId == null) return;
    _repository.submitWord(
      roomCode: state.room!.code,
      userId: _currentUserId!,
      word: word,
      startCoord: start,
      endCoord: end,
    );
  }

  void voteRematch() {
    if (state.room == null || _currentUserId == null) return;
    _repository.voteRematch(roomCode: state.room!.code, userId: _currentUserId!);
  }

  void leaveRoom() {
    if (state.room != null && _currentUserId != null) {
      _repository.leaveRoom(roomCode: state.room!.code, userId: _currentUserId!);
    }
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
