import 'dart:async';
import 'package:wordhive_app/features/game/domain/entities/game_event_entities.dart';
import 'package:wordhive_app/features/game/domain/entities/game_room_entity.dart';
import 'package:wordhive_app/features/game/domain/entities/room_lobby_entities.dart';
import 'package:wordhive_app/features/game/domain/repositories/game_repository.dart';

RoomPlayerEntity fakePlayer(String id, {bool host = false, bool ready = false}) => RoomPlayerEntity(
      userId: id,
      username: id.toUpperCase(),
      isHost: host,
      isReady: ready || host,
      score: 0,
      wordsFound: const [],
      colorHex: '#7C3AED',
    );

GameRoomEntity fakeRoom({List<RoomPlayerEntity>? players}) => GameRoomEntity(
      id: 'r1',
      code: 'ABC123',
      wordSearchId: 'ws',
      wordSearchTitle: 'Frutas',
      hostUserId: 'host',
      status: RoomStatusEnum.waiting,
      maxPlayers: 4,
      isPrivate: false,
      players: players ?? [fakePlayer('host', host: true)],
    );

/// Repositorio en memoria: guarda lo que la app envia y deja simular lo que manda el servidor.
class FakeGameRepository implements GameRepository {
  final sent = <String>[];
  RoomPlayersSnapshot joinResult = RoomPlayersSnapshot(hostUserId: 'host', players: [fakePlayer('host', host: true)]);
  Object? joinError;

  final players = StreamController<RoomPlayersSnapshot>.broadcast();
  final roomErrors = StreamController<RoomFlowException>.broadcast();
  final countdown = StreamController<Map<String, dynamic>>.broadcast();
  final started = StreamController<Map<String, dynamic>>.broadcast();
  final rematchStarted = StreamController<Map<String, dynamic>>.broadcast();
  final gameEnded = StreamController<List<PodiumEntryEntity>>.broadcast();

  @override
  Future<GameRoomEntity> createRoom(
          {required String wordSearchId, int? maxPlayers, int? timeLimitSeconds, bool? isPrivate}) async =>
      fakeRoom();

  @override
  Future<GameRoomEntity> getRoomByCode(String code) async => fakeRoom();

  @override
  Future<RoomPlayersSnapshot> joinRoom(
      {required String roomCode, required String userId, required String username, String? avatarUrl}) async {
    sent.add('join:$userId');
    if (joinError != null) throw joinError!;
    return joinResult;
  }

  @override
  void toggleReady({required String roomCode, required String userId, required bool isReady}) =>
      sent.add('ready:$userId:$isReady');

  @override
  void startGame({required String roomCode, required String userId}) => sent.add('start:$userId');

  @override
  void leaveRoom({required String roomCode, required String userId}) => sent.add('leave:$userId');

  @override
  void voteRematch({required String roomCode, required String userId}) {}

  @override
  void submitWord(
      {required String roomCode,
      required String userId,
      required String word,
      required List<int> startCoord,
      required List<int> endCoord}) {}

  @override
  void connectSocket() {}

  @override
  void disconnectSocket() {}

  @override
  Stream<RoomPlayersSnapshot> onPlayersChanged() => players.stream;
  @override
  Stream<RoomFlowException> onRoomError() => roomErrors.stream;
  @override
  Stream<Map<String, dynamic>> onGameCountdown() => countdown.stream;
  @override
  Stream<Map<String, dynamic>> onGameStarted() => started.stream;
  @override
  Stream<WordFoundEventEntity> onWordFound() => const Stream.empty();
  @override
  Stream<List<LeaderboardEntryEntity>> onLeaderboardUpdated() => const Stream.empty();
  @override
  Stream<List<PodiumEntryEntity>> onGameEnded() => gameEnded.stream;
  @override
  Stream<RematchVoteStateEntity> onRematchUpdate() => const Stream.empty();
  @override
  Stream<Map<String, dynamic>> onRematchStarted() => rematchStarted.stream;
}
