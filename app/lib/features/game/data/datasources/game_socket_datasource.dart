import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/constants/api_endpoints.dart';
import '../models/game_event_models.dart';
import '../models/room_lobby_models.dart';
import 'game_socket_streams.dart';

class GameSocketDataSource {
  static const _ackTimeout = Duration(seconds: 10);
  io.Socket? _socket;

  /// Ultima sala a la que entramos: si la conexion se cae y vuelve, entramos de nuevo solos.
  Map<String, dynamic>? _activeJoin;

  final streams = GameSocketStreams();

  Stream<RoomPlayersSnapshotModel> get onPlayersChanged => streams.onPlayersChanged;
  Stream<Map<String, dynamic>> get onRoomError => streams.onRoomError;
  Stream<Map<String, dynamic>> get onGameCountdown => streams.onGameCountdown;
  Stream<Map<String, dynamic>> get onGameStarted => streams.onGameStarted;
  Stream<WordFoundEventModel> get onWordFound => streams.onWordFound;
  Stream<List<LeaderboardEntryModel>> get onLeaderboardUpdated => streams.onLeaderboardUpdated;
  Stream<List<PodiumEntryModel>> get onGameEnded => streams.onGameEnded;
  Stream<RematchVoteStateModel> get onRematchUpdate => streams.onRematchUpdate;
  Stream<Map<String, dynamic>> get onRematchStarted => streams.onRematchStarted;
  Stream<bool> get onConnectionChanged => streams.onConnectionChanged;

  void connect() {
    if (_socket != null) return;

    final socket = io.io(
      ApiEndpoints.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .enableForceNew()
          .build(),
    );
    _socket = socket;

    streams.bind(socket);
    socket.onReconnect((_) {
      final join = _activeJoin;
      if (join == null) return;
      _emitJoin(join).then((ack) {
        streams.pushPlayers(ack['room']);
        streams.pushClaimedWords(ack['room']);
      });
    });
  }

  /// Entra a la sala y espera la confirmacion del servidor (con la lista real de jugadores).
  Future<Map<String, dynamic>> joinRoom({
    required String roomCode,
    required String userId,
    required String username,
    String? avatarUrl,
  }) async {
    connect();
    final join = {'roomCode': roomCode.toUpperCase(), 'userId': userId, 'username': username, 'avatarUrl': avatarUrl};
    final ack = await _emitJoin(join);
    if (ack['success'] == true) _activeJoin = join;
    return ack;
  }

  Future<Map<String, dynamic>> _emitJoin(Map<String, dynamic> join) {
    final done = Completer<Map<String, dynamic>>();
    _socket?.emitWithAck('room:join', join, ack: (data) {
      if (!done.isCompleted) done.complete(GameSocketStreams.asMap(data));
    });
    return done.future.timeout(_ackTimeout, onTimeout: () => {'success': false, 'error': 'SIN_CONEXION'});
  }

  void leaveRoom({required String roomCode, required String userId}) {
    _activeJoin = null;
    _socket?.emit('room:leave', {'roomCode': roomCode.toUpperCase(), 'userId': userId});
  }

  void toggleReady({required String roomCode, required String userId, required bool isReady}) {
    _socket?.emit('room:toggle_ready', {'roomCode': roomCode.toUpperCase(), 'userId': userId, 'isReady': isReady});
  }

  void startGame({required String roomCode, required String userId}) {
    _socket?.emit('game:start', {'roomCode': roomCode.toUpperCase(), 'userId': userId});
  }

  /// Devuelve null si el servidor acepto la palabra, o el codigo de error.
  Future<String?> submitWord({
    required String roomCode,
    required String userId,
    required String word,
    required List<int> startCoord,
    required List<int> endCoord,
  }) {
    final done = Completer<String?>();
    final payload = {
      'roomCode': roomCode.toUpperCase(),
      'userId': userId,
      'word': word,
      'coordinates': {'start': startCoord, 'end': endCoord},
    };
    _socket?.emitWithAck('word:submit', payload, ack: (data) {
      final ack = GameSocketStreams.asMap(data);
      if (!done.isCompleted) done.complete(ack['success'] == true ? null : ack['error']?.toString());
    });
    return done.future.timeout(_ackTimeout, onTimeout: () => 'SIN_CONEXION');
  }

  void voteRematch({required String roomCode, required String userId}) {
    _socket?.emit('room:rematch_vote', {'roomCode': roomCode.toUpperCase(), 'userId': userId});
  }

  void disconnect() {
    _activeJoin = null;
    _socket?.dispose();
    _socket = null;
  }
}
