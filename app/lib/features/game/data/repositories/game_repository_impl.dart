import '../../domain/entities/game_room_entity.dart';
import '../../domain/entities/game_event_entities.dart';
import '../../domain/entities/room_lobby_entities.dart';
import '../../domain/repositories/game_repository.dart';
import '../models/room_lobby_models.dart';
import '../datasources/game_remote_datasource.dart';
import '../datasources/game_socket_datasource.dart';

class GameRepositoryImpl implements GameRepository {
  final GameRemoteDataSource _remoteDataSource;
  final GameSocketDataSource _socketDataSource;

  GameRepositoryImpl({
    GameRemoteDataSource? remoteDataSource,
    GameSocketDataSource? socketDataSource,
  })  : _remoteDataSource = remoteDataSource ?? GameRemoteDataSourceImpl(),
        _socketDataSource = socketDataSource ?? GameSocketDataSource();

  @override
  Future<GameRoomEntity> createRoom({
    required String wordSearchId,
    int? maxPlayers,
    int? timeLimitSeconds,
    bool? isPrivate,
  }) {
    return _remoteDataSource.createRoom(
      wordSearchId: wordSearchId,
      maxPlayers: maxPlayers,
      timeLimitSeconds: timeLimitSeconds,
      isPrivate: isPrivate,
    );
  }

  @override
  Future<GameRoomEntity> getRoomByCode(String code) {
    return _remoteDataSource.getRoomByCode(code);
  }

  @override
  void connectSocket() => _socketDataSource.connect();

  @override
  void disconnectSocket() => _socketDataSource.disconnect();

  @override
  Future<RoomPlayersSnapshot> joinRoom({
    required String roomCode,
    required String userId,
    required String username,
    String? avatarUrl,
  }) async {
    final ack = await _socketDataSource.joinRoom(
      roomCode: roomCode,
      userId: userId,
      username: username,
      avatarUrl: avatarUrl,
    );
    final snapshot = RoomPlayersSnapshotModel.tryParse(ack['room']);
    if (ack['success'] != true || snapshot == null) {
      throw RoomFlowExceptionModel.fromCode(ack['error']?.toString());
    }
    return snapshot;
  }

  @override
  void leaveRoom({required String roomCode, required String userId}) {
    _socketDataSource.leaveRoom(roomCode: roomCode, userId: userId);
  }

  @override
  void toggleReady({
    required String roomCode,
    required String userId,
    required bool isReady,
  }) {
    _socketDataSource.toggleReady(roomCode: roomCode, userId: userId, isReady: isReady);
  }

  @override
  void startGame({required String roomCode, required String userId}) {
    _socketDataSource.startGame(roomCode: roomCode, userId: userId);
  }

  @override
  Future<String?> submitWord({
    required String roomCode,
    required String userId,
    required String word,
    required List<int> startCoord,
    required List<int> endCoord,
  }) {
    return _socketDataSource.submitWord(
      roomCode: roomCode,
      userId: userId,
      word: word,
      startCoord: startCoord,
      endCoord: endCoord,
    );
  }

  @override
  void voteRematch({required String roomCode, required String userId}) {
    _socketDataSource.voteRematch(roomCode: roomCode, userId: userId);
  }

  @override
  Stream<RoomPlayersSnapshot> onPlayersChanged() => _socketDataSource.onPlayersChanged;

  @override
  Stream<RoomFlowException> onRoomError() => _socketDataSource.onRoomError.map(RoomFlowExceptionModel.fromJson);

  @override
  Stream<Map<String, dynamic>> onGameCountdown() => _socketDataSource.onGameCountdown;

  @override
  Stream<Map<String, dynamic>> onGameStarted() => _socketDataSource.onGameStarted;

  @override
  Stream<WordFoundEventEntity> onWordFound() => _socketDataSource.onWordFound;

  @override
  Stream<List<LeaderboardEntryEntity>> onLeaderboardUpdated() => _socketDataSource.onLeaderboardUpdated;

  @override
  Stream<List<PodiumEntryEntity>> onGameEnded() => _socketDataSource.onGameEnded;

  @override
  Stream<RematchVoteStateEntity> onRematchUpdate() => _socketDataSource.onRematchUpdate;

  @override
  Stream<Map<String, dynamic>> onRematchStarted() => _socketDataSource.onRematchStarted;

  @override
  Stream<bool> onConnectionChanged() => _socketDataSource.onConnectionChanged;
}
