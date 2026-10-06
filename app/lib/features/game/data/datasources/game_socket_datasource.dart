import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/constants/api_endpoints.dart';
import '../models/game_event_models.dart';
import '../models/room_lobby_models.dart';

class GameSocketDataSource {
  static const _ackTimeout = Duration(seconds: 10);
  io.Socket? _socket;

  /// Ultima sala a la que entramos: si la conexion se cae y vuelve, entramos de nuevo solos.
  Map<String, dynamic>? _activeJoin;

  final _playersCtrl = StreamController<RoomPlayersSnapshotModel>.broadcast();
  final _roomErrorCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _countdownCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _gameStartedCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _wordFoundCtrl = StreamController<WordFoundEventModel>.broadcast();
  final _leaderboardCtrl = StreamController<List<LeaderboardEntryModel>>.broadcast();
  final _gameEndedCtrl = StreamController<List<PodiumEntryModel>>.broadcast();
  final _rematchUpdateCtrl = StreamController<RematchVoteStateModel>.broadcast();
  final _rematchStartedCtrl = StreamController<Map<String, dynamic>>.broadcast();

  Stream<RoomPlayersSnapshotModel> get onPlayersChanged => _playersCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomError => _roomErrorCtrl.stream;
  Stream<Map<String, dynamic>> get onGameCountdown => _countdownCtrl.stream;
  Stream<Map<String, dynamic>> get onGameStarted => _gameStartedCtrl.stream;
  Stream<WordFoundEventModel> get onWordFound => _wordFoundCtrl.stream;
  Stream<List<LeaderboardEntryModel>> get onLeaderboardUpdated => _leaderboardCtrl.stream;
  Stream<List<PodiumEntryModel>> get onGameEnded => _gameEndedCtrl.stream;
  Stream<RematchVoteStateModel> get onRematchUpdate => _rematchUpdateCtrl.stream;
  Stream<Map<String, dynamic>> get onRematchStarted => _rematchStartedCtrl.stream;

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

    for (final event in ['player:joined', 'player:left', 'player:ready_changed']) {
      socket.on(event, (data) => _pushPlayers(data));
    }
    socket.on('room:error', (data) => _roomErrorCtrl.add(_asMap(data)));
    socket.on('game:countdown', (data) => _countdownCtrl.add(_asMap(data)));
    socket.on('game:started', (data) => _gameStartedCtrl.add(_asMap(data)));
    socket.on('word:found', (data) {
      if (data != null) _wordFoundCtrl.add(WordFoundEventModel.fromJson(data));
    });
    socket.on('leaderboard:update', (data) {
      if (data != null && data['leaderboard'] is List) {
        _leaderboardCtrl.add((data['leaderboard'] as List).map((e) => LeaderboardEntryModel.fromJson(e)).toList());
      }
    });
    socket.on('game:ended', (data) {
      if (data != null && data['podium'] is List) {
        _gameEndedCtrl.add((data['podium'] as List).map((e) => PodiumEntryModel.fromJson(e)).toList());
      }
    });
    socket.on('room:rematch_update', (data) {
      if (data != null) _rematchUpdateCtrl.add(RematchVoteStateModel.fromJson(data));
    });
    socket.on('room:rematch_started', (data) {
      _rematchStartedCtrl.add(_asMap(data));
      _pushPlayers(data);
    });
    socket.onReconnect((_) {
      final join = _activeJoin;
      if (join != null) _emitJoin(join).then((ack) => _pushPlayers(ack['room']));
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
      if (!done.isCompleted) done.complete(_asMap(data));
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

  void submitWord({
    required String roomCode,
    required String userId,
    required String word,
    required List<int> startCoord,
    required List<int> endCoord,
  }) {
    _socket?.emit('word:submit', {
      'roomCode': roomCode.toUpperCase(),
      'userId': userId,
      'word': word,
      'coordinates': {'start': startCoord, 'end': endCoord},
    });
  }

  void voteRematch({required String roomCode, required String userId}) {
    _socket?.emit('room:rematch_vote', {'roomCode': roomCode.toUpperCase(), 'userId': userId});
  }

  void disconnect() {
    _activeJoin = null;
    _socket?.dispose();
    _socket = null;
  }

  void _pushPlayers(dynamic data) {
    final snapshot = RoomPlayersSnapshotModel.tryParse(data);
    if (snapshot != null) _playersCtrl.add(snapshot);
  }

  static Map<String, dynamic> _asMap(dynamic data) =>
      data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
}
