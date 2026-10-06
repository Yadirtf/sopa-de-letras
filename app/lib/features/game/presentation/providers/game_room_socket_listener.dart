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
    final subscriptions = <StreamSubscription>[];

    subscriptions.add(repository.onPlayerJoined().listen((player) {
      final state = getState();
      if (state.room == null) return;
      final players = List<RoomPlayerEntity>.from(state.room!.players);
      final index = players.indexWhere((p) => p.userId == player.userId);
      if (index >= 0) {
        players[index] = player;
      } else {
        players.add(player);
      }
      setState(state.copyWith(
        room: _rebuildRoom(state.room!, players: players),
      ));
    }));

    subscriptions.add(repository.onPlayerLeft().listen((data) {
      final state = getState();
      if (state.room == null) return;
      final leftId = data['userId'];
      final players = state.room!.players.where((p) => p.userId != leftId).toList();
      final newHostId = data['newHostId'] ?? state.room!.hostUserId;
      setState(state.copyWith(
        room: _rebuildRoom(state.room!, players: players, hostId: newHostId),
      ));
    }));

    subscriptions.add(repository.onGameCountdown().listen((data) {
      final state = getState();
      setState(state.copyWith(countdownValue: data['countdownSeconds'] ?? 3));
    }));

    subscriptions.add(repository.onGameStarted().listen((data) {
      final state = getState();
      List<List<String>> grid = [];
      if (data['grid'] is List) {
        grid = (data['grid'] as List)
            .map((r) => (r as List).map((c) => c.toString()).toList())
            .toList();
      }
      List<String> words = [];
      if (data['words'] is List) {
        words = (data['words'] as List).map((w) => w.toString()).toList();
      }

      setState(state.copyWith(
        clearCountdown: true,
        isGameActive: true,
        room: state.room != null
            ? _rebuildRoom(
                state.room!,
                status: RoomStatusEnum.inProgress,
                grid: grid.isNotEmpty ? grid : state.room!.grid,
                words: words.isNotEmpty ? words : state.room!.words,
              )
            : null,
      ));
    }));

    subscriptions.add(repository.onWordFound().listen((event) {
      final state = getState();
      final updated = Map<String, dynamic>.from(state.claimedWords);
      updated[event.word.toUpperCase()] = event;
      setState(state.copyWith(
        claimedWords: updated.cast(),
        latestWordFound: event,
      ));
    }));

    subscriptions.add(repository.onLeaderboardUpdated().listen((entries) {
      final state = getState();
      setState(state.copyWith(leaderboard: entries));
    }));

    subscriptions.add(repository.onGameEnded().listen((podium) {
      final state = getState();
      setState(state.copyWith(isGameActive: false, podium: podium));
    }));

    subscriptions.add(repository.onRematchUpdate().listen((rematch) {
      final state = getState();
      setState(state.copyWith(rematchState: rematch));
    }));

    return subscriptions;
  }

  static GameRoomEntity _rebuildRoom(
    GameRoomEntity r, {
    List<RoomPlayerEntity>? players,
    String? hostId,
    RoomStatusEnum? status,
    List<List<String>>? grid,
    List<String>? words,
  }) {
    return GameRoomEntity(
      id: r.id,
      code: r.code,
      wordSearchId: r.wordSearchId,
      wordSearchTitle: r.wordSearchTitle,
      hostUserId: hostId ?? r.hostUserId,
      status: status ?? r.status,
      maxPlayers: r.maxPlayers,
      timeLimitSeconds: r.timeLimitSeconds,
      isPrivate: r.isPrivate,
      players: players ?? r.players,
      grid: grid ?? r.grid,
      words: words ?? r.words,
    );
  }
}
