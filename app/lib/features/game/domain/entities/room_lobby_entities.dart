import 'package:equatable/equatable.dart';
import 'game_room_entity.dart';

/// Foto completa de quien esta en la sala. El servidor la manda en cada cambio
/// (entra, sale, listo) para que todos los telefonos vean exactamente lo mismo.
class RoomPlayersSnapshot extends Equatable {
  final String? hostUserId;
  final List<RoomPlayerEntity> players;

  const RoomPlayersSnapshot({this.hostUserId, required this.players});

  @override
  List<Object?> get props => [hostUserId, players];
}

/// Aviso de la sala (no se pudo iniciar, sala llena...) listo para mostrar.
class RoomFlowException implements Exception {
  final String code;
  final String message;

  const RoomFlowException(this.code, this.message);

  @override
  String toString() => message;
}

/// Lo que el lobby necesita saber para pintar sus botones, calculado en un solo sitio.
class LobbyReadiness {
  final bool isHost;
  final bool isReady;
  final int readyCount;
  final int totalPlayers;
  final List<String> pendingNames;

  const LobbyReadiness._({
    required this.isHost,
    required this.isReady,
    required this.readyCount,
    required this.totalPlayers,
    required this.pendingNames,
  });

  factory LobbyReadiness.of(GameRoomEntity room, String? userId) {
    final isHost = userId != null && room.hostUserId == userId;
    final me = room.players.where((p) => p.userId == userId).firstOrNull;
    // El anfitrion cuenta siempre como listo: su forma de estarlo es pulsar Iniciar.
    bool ready(RoomPlayerEntity p) => p.isReady || p.userId == room.hostUserId;
    return LobbyReadiness._(
      isHost: isHost,
      isReady: isHost || (me?.isReady ?? false),
      readyCount: room.players.where(ready).length,
      totalPlayers: room.players.length,
      pendingNames: room.players.where((p) => !ready(p)).map((p) => p.username).toList(),
    );
  }

  bool get everyoneReady => pendingNames.isEmpty;
}
