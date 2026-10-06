import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/api_endpoints.dart';

/// Conexión "social" en tiempo real (Épica 5).
///
/// Es un socket separado del de partidas (`enableForceNew`): el socket de
/// juego se destruye al salir de una sala, pero este debe vivir mientras la
/// app esté abierta para recibir invitaciones, presencia y notificaciones.
/// Se autentica con el JWT en el handshake y late cada 25 s para que el
/// servidor nos mantenga "En línea" (TTL de presencia: 60 s).
class SocialSocketClient {
  static const heartbeatInterval = Duration(seconds: 25);

  io.Socket? _socket;
  Timer? _heartbeat;

  final _notifications = StreamController<Map<String, dynamic>>.broadcast();
  final _presence = StreamController<Map<String, dynamic>>.broadcast();
  final _invites = StreamController<Map<String, dynamic>>.broadcast();
  final _friendships = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onNotification => _notifications.stream;
  Stream<Map<String, dynamic>> get onFriendPresence => _presence.stream;
  Stream<Map<String, dynamic>> get onRoomInvite => _invites.stream;
  Stream<Map<String, dynamic>> get onFriendshipUpdated => _friendships.stream;

  bool get isConnected => _socket?.connected ?? false;

  void connect(String accessToken) {
    disconnect();
    final socket = io.io(
      ApiEndpoints.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': accessToken})
          .enableForceNew()
          .enableReconnection()
          .disableAutoConnect()
          .build(),
    );

    _pipe(socket, 'notification:new', _notifications);
    _pipe(socket, 'friend:presence', _presence);
    _pipe(socket, 'room:invite_received', _invites);
    _pipe(socket, 'friendship:updated', _friendships);

    socket.connect();
    _socket = socket;
    _heartbeat = Timer.periodic(heartbeatInterval, (_) {
      if (socket.connected) socket.emit('presence:heartbeat');
    });
  }

  void disconnect() {
    _heartbeat?.cancel();
    _heartbeat = null;
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _notifications.close();
    _presence.close();
    _invites.close();
    _friendships.close();
  }

  void _pipe(io.Socket socket, String event, StreamController<Map<String, dynamic>> sink) {
    socket.on(event, (data) {
      if (data is Map && !sink.isClosed) sink.add(Map<String, dynamic>.from(data));
    });
  }
}
