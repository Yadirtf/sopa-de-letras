import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/constants/api_endpoints.dart';
import '../models/game_room_model.dart';
import '../models/game_event_models.dart';

class GameSocketDataSource {
  io.Socket? _socket;

  final _playerJoinedCtrl = StreamController<RoomPlayerModel>.broadcast();
  final _playerLeftCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _playerReadyCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _countdownCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _gameStartedCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _wordFoundCtrl = StreamController<WordFoundEventModel>.broadcast();
  final _leaderboardCtrl = StreamController<List<LeaderboardEntryModel>>.broadcast();
  final _gameEndedCtrl = StreamController<List<PodiumEntryModel>>.broadcast();
  final _rematchUpdateCtrl = StreamController<RematchVoteStateModel>.broadcast();
  final _rematchStartedCtrl = StreamController<Map<String, dynamic>>.broadcast();

  Stream<RoomPlayerModel> get onPlayerJoined => _playerJoinedCtrl.stream;
  Stream<Map<String, dynamic>> get onPlayerLeft => _playerLeftCtrl.stream;
  Stream<Map<String, dynamic>> get onPlayerReadyChanged => _playerReadyCtrl.stream;
  Stream<Map<String, dynamic>> get onGameCountdown => _countdownCtrl.stream;
  Stream<Map<String, dynamic>> get onGameStarted => _gameStartedCtrl.stream;
  Stream<WordFoundEventModel> get onWordFound => _wordFoundCtrl.stream;
  Stream<List<LeaderboardEntryModel>> get onLeaderboardUpdated => _leaderboardCtrl.stream;
  Stream<List<PodiumEntryModel>> get onGameEnded => _gameEndedCtrl.stream;
  Stream<RematchVoteStateModel> get onRematchUpdate => _rematchUpdateCtrl.stream;
  Stream<Map<String, dynamic>> get onRematchStarted => _rematchStartedCtrl.stream;

  void connect() {
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(
      ApiEndpoints.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .build(),
    );

    _socket?.on('player:joined', (data) {
      if (data != null && data['player'] != null) {
        _playerJoinedCtrl.add(RoomPlayerModel.fromJson(data['player']));
      }
    });

    _socket?.on('player:left', (data) {
      if (data != null) _playerLeftCtrl.add(Map<String, dynamic>.from(data));
    });

    _socket?.on('player:ready_changed', (data) {
      if (data != null) _playerReadyCtrl.add(Map<String, dynamic>.from(data));
    });

    _socket?.on('game:countdown', (data) {
      if (data != null) _countdownCtrl.add(Map<String, dynamic>.from(data));
    });

    _socket?.on('game:started', (data) {
      if (data != null) _gameStartedCtrl.add(Map<String, dynamic>.from(data));
    });

    _socket?.on('word:found', (data) {
      if (data != null) _wordFoundCtrl.add(WordFoundEventModel.fromJson(data));
    });

    _socket?.on('leaderboard:update', (data) {
      if (data != null && data['leaderboard'] is List) {
        final list = (data['leaderboard'] as List)
            .map((e) => LeaderboardEntryModel.fromJson(e))
            .toList();
        _leaderboardCtrl.add(list);
      }
    });

    _socket?.on('game:ended', (data) {
      if (data != null && data['podium'] is List) {
        final list = (data['podium'] as List)
            .map((e) => PodiumEntryModel.fromJson(e))
            .toList();
        _gameEndedCtrl.add(list);
      }
    });

    _socket?.on('room:rematch_update', (data) {
      if (data != null) _rematchUpdateCtrl.add(RematchVoteStateModel.fromJson(data));
    });

    _socket?.on('room:rematch_started', (data) {
      if (data != null) _rematchStartedCtrl.add(Map<String, dynamic>.from(data));
    });
  }

  void joinRoom({required String roomCode, required String userId, required String username, String? avatarUrl}) {
    connect();
    _socket?.emit('room:join', {
      'roomCode': roomCode.toUpperCase(),
      'userId': userId,
      'username': username,
      'avatarUrl': avatarUrl,
    });
  }

  void leaveRoom({required String roomCode, required String userId}) {
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
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}
