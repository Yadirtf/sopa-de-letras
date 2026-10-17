import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/constants/api_endpoints.dart';
import '../../domain/repositories/battle_repository.dart';
import '../models/battle_view_model.dart';

/// Socket propio de la batalla (espacio `/battle`, aparte del de la sopa).
/// Se identifica con el token de la sesión; si se corta y vuelve, entra solo
/// otra vez a la sala para recibir la vista al día.
class BattleSocketDataSource {
  static const _ackTimeout = Duration(seconds: 10);

  io.Socket? _socket;
  String? _activeCode;
  final _updates = StreamController<BattleUpdate>.broadcast();
  final _connection = StreamController<bool>.broadcast();
  final _reactions = StreamController<BattleReactionEvent>.broadcast();

  Stream<BattleUpdate> get updates => _updates.stream;
  Stream<BattleReactionEvent> get reactions => _reactions.stream;
  Stream<bool> get connection => _connection.stream;

  void connect(String token) {
    if (_socket != null) return;
    final socket = io.io(
      '${ApiEndpoints.socketUrl}/battle',
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableForceNew()
          .enableReconnection()
          .build(),
    );
    socket.on('state', (data) {
      if (data is! Map || _updates.isClosed) return;
      final map = data.cast<String, dynamic>();
      final view = BattleViewModel.fromJson((map['view'] as Map).cast<String, dynamic>());
      final shot = map['shot'] is Map ? BattleViewModel.shot((map['shot'] as Map).cast<String, dynamic>()) : null;
      _updates.add(BattleUpdate(view, shot));
    });
    socket.on('reaction', (data) {
      if (data is! Map || _reactions.isClosed) return;
      final from = data['fromUserId'], id = data['reaction'];
      if (from is String && id is String) _reactions.add(BattleReactionEvent(from, id));
    });
    socket.onConnect((_) => _connection.add(true));
    socket.onDisconnect((_) => _connection.add(false));
    socket.onReconnect((_) {
      final code = _activeCode;
      if (code != null) emit('join', {'code': code});
    });
    _socket = socket;
  }

  /// Envía un evento y espera la respuesta; lanza [BattleFailure] si el servidor dice que no.
  Future<Map<String, dynamic>> emit(String event, Map<String, dynamic> payload) {
    final socket = _socket;
    if (socket == null) return Future.error(const BattleFailure('SIN_CONEXION', 'Sin conexión con la batalla.'));
    if (event == 'join') _activeCode = payload['code']?.toString();
    final done = Completer<Map<String, dynamic>>();
    socket.emitWithAck(event, payload, ack: (data) {
      if (done.isCompleted) return;
      final reply = data is Map ? data.cast<String, dynamic>() : <String, dynamic>{};
      if (reply['ok'] == true) {
        done.complete(reply);
      } else {
        done.completeError(BattleFailure(
          reply['code']?.toString() ?? 'ERROR',
          reply['message']?.toString() ?? 'No pudimos completar la acción. Inténtalo de nuevo.',
        ));
      }
    });
    return done.future.timeout(
      _ackTimeout,
      onTimeout: () => throw const BattleFailure('SIN_CONEXION', 'No pudimos conectarnos. Revisa tu internet.'),
    );
  }

  void disconnect() {
    _activeCode = null;
    _socket?.dispose();
    _socket = null;
  }
}
