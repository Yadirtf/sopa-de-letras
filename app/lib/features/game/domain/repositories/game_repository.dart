import '../entities/game_room_entity.dart';
import '../entities/game_event_entities.dart';
import '../entities/room_lobby_entities.dart';

abstract class GameRepository {
  Future<GameRoomEntity> createRoom({
    required String wordSearchId,
    int? maxPlayers,
    int? timeLimitSeconds,
    bool? isPrivate,
  });

  Future<GameRoomEntity> getRoomByCode(String code);

  void connectSocket();
  void disconnectSocket();

  /// Entra por socket y devuelve quien esta en la sala; lanza [RoomFlowException] si no se pudo.
  Future<RoomPlayersSnapshot> joinRoom({
    required String roomCode,
    required String userId,
    required String username,
    String? avatarUrl,
  });

  void leaveRoom({required String roomCode, required String userId});

  void toggleReady({
    required String roomCode,
    required String userId,
    required bool isReady,
  });

  void startGame({required String roomCode, required String userId});

  /// null si la palabra fue aceptada; si no, el codigo de error del servidor.
  Future<String?> submitWord({
    required String roomCode,
    required String userId,
    required String word,
    required List<int> startCoord,
    required List<int> endCoord,
  });

  void voteRematch({required String roomCode, required String userId});

  // Socket Streams
  Stream<RoomPlayersSnapshot> onPlayersChanged();
  Stream<RoomFlowException> onRoomError();
  Stream<Map<String, dynamic>> onGameCountdown();
  Stream<Map<String, dynamic>> onGameStarted();
  Stream<WordFoundEventEntity> onWordFound();
  Stream<List<LeaderboardEntryEntity>> onLeaderboardUpdated();
  Stream<List<PodiumEntryEntity>> onGameEnded();
  Stream<RematchVoteStateEntity> onRematchUpdate();
  Stream<Map<String, dynamic>> onRematchStarted();

  /// true al conectar o reconectar; false cuando se cae el internet.
  Stream<bool> onConnectionChanged();
}
