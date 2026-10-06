import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../models/game_event_models.dart';
import '../models/room_lobby_models.dart';

/// Traduce los eventos del socket de juego a streams tipados.
/// Vive aparte del datasource para que este solo se ocupe de conectar y emitir.
class GameSocketStreams {
  final _playersCtrl = StreamController<RoomPlayersSnapshotModel>.broadcast();
  final _roomErrorCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _countdownCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _gameStartedCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _wordFoundCtrl = StreamController<WordFoundEventModel>.broadcast();
  final _leaderboardCtrl = StreamController<List<LeaderboardEntryModel>>.broadcast();
  final _gameEndedCtrl = StreamController<List<PodiumEntryModel>>.broadcast();
  final _rematchUpdateCtrl = StreamController<RematchVoteStateModel>.broadcast();
  final _rematchStartedCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _connectionCtrl = StreamController<bool>.broadcast();

  Stream<RoomPlayersSnapshotModel> get onPlayersChanged => _playersCtrl.stream;
  Stream<Map<String, dynamic>> get onRoomError => _roomErrorCtrl.stream;
  Stream<Map<String, dynamic>> get onGameCountdown => _countdownCtrl.stream;
  Stream<Map<String, dynamic>> get onGameStarted => _gameStartedCtrl.stream;
  Stream<WordFoundEventModel> get onWordFound => _wordFoundCtrl.stream;
  Stream<List<LeaderboardEntryModel>> get onLeaderboardUpdated => _leaderboardCtrl.stream;
  Stream<List<PodiumEntryModel>> get onGameEnded => _gameEndedCtrl.stream;
  Stream<RematchVoteStateModel> get onRematchUpdate => _rematchUpdateCtrl.stream;
  Stream<Map<String, dynamic>> get onRematchStarted => _rematchStartedCtrl.stream;

  /// true = conectado, false = se cayo el internet (el socket reintenta solo).
  Stream<bool> get onConnectionChanged => _connectionCtrl.stream;

  void bind(io.Socket socket) {
    for (final event in ['player:joined', 'player:left', 'player:ready_changed', 'player:connection_changed']) {
      socket.on(event, pushPlayers);
    }
    socket.on('room:error', (data) => _roomErrorCtrl.add(asMap(data)));
    socket.on('game:countdown', (data) => _countdownCtrl.add(asMap(data)));
    socket.on('game:started', (data) => _gameStartedCtrl.add(asMap(data)));
    socket.on('word:found', (data) {
      if (data is Map) _wordFoundCtrl.add(WordFoundEventModel.fromJson(asMap(data)));
    });
    socket.on('leaderboard:update', (data) {
      if (data is Map && data['leaderboard'] is List) {
        _leaderboardCtrl.add((data['leaderboard'] as List).map((e) => LeaderboardEntryModel.fromJson(e)).toList());
      }
    });
    socket.on('game:ended', (data) {
      if (data is Map && data['podium'] is List) {
        _gameEndedCtrl.add((data['podium'] as List).map((e) => PodiumEntryModel.fromJson(e)).toList());
      }
    });
    socket.on('room:rematch_update', (data) {
      if (data is Map) _rematchUpdateCtrl.add(RematchVoteStateModel.fromJson(asMap(data)));
    });
    socket.on('room:rematch_started', (data) {
      _rematchStartedCtrl.add(asMap(data));
      pushPlayers(data);
    });
    socket.onConnect((_) => _connectionCtrl.add(true));
    socket.onDisconnect((_) => _connectionCtrl.add(false));
  }

  void pushPlayers(dynamic data) {
    final snapshot = RoomPlayersSnapshotModel.tryParse(data);
    if (snapshot != null) _playersCtrl.add(snapshot);
  }

  /// Al volver de una caida, la sala trae donde marco cada palabra este
  /// jugador: las re-emitimos para repintar SU sopa (la de los demas es privada).
  void pushMyWords(dynamic room, dynamic userId) {
    if (room is! Map || room['players'] is! List) return;
    final me = (room['players'] as List).whereType<Map>().where((p) => p['userId'] == userId).firstOrNull;
    final coords = me?['wordCoords'];
    if (me == null || coords is! Map) return;
    final claim = {'userId': me['userId'], 'username': me['username'], 'colorHex': me['colorHex']};
    coords.forEach((word, c) {
      if (c is Map) _wordFoundCtrl.add(WordFoundEventModel.fromClaim(word.toString(), {...claim, ...asMap(c)}));
    });
  }

  static Map<String, dynamic> asMap(dynamic data) =>
      data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
}
