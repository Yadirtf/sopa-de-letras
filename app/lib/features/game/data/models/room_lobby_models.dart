import '../../domain/entities/room_lobby_entities.dart';
import 'game_room_model.dart';

class RoomPlayersSnapshotModel extends RoomPlayersSnapshot {
  const RoomPlayersSnapshotModel({super.hostUserId, required super.players});

  /// Acepta player:joined, player:left, player:ready_changed y el ack de room:join.
  static RoomPlayersSnapshotModel? tryParse(dynamic data) {
    if (data is! Map) return null;
    final raw = data['players'];
    if (raw is! List) return null;
    return RoomPlayersSnapshotModel(
      hostUserId: (data['hostUserId'] ?? data['newHostId'])?.toString(),
      players: raw.whereType<Map>().map((p) => RoomPlayerModel.fromJson(Map<String, dynamic>.from(p))).toList(),
    );
  }
}

/// Traduce los codigos del servidor a frases que entiende cualquier jugador.
class RoomFlowExceptionModel {
  static const _friendly = {
    'SALA_NO_ENCONTRADA': 'Esta sala ya no existe',
    'SALA_LLENA': 'La sala está llena',
    'PARTIDA_EN_CURSO': 'La partida ya comenzó',
    'SIN_CONEXION': 'No pudimos conectar con la sala. Revisa tu internet e inténtalo de nuevo.',
  };

  static RoomFlowException fromCode(String? code, [String? message]) {
    final key = code ?? 'ERROR_DESCONOCIDO';
    return RoomFlowException(key, _friendly[key] ?? message ?? 'Algo salió mal. Inténtalo de nuevo.');
  }

  static RoomFlowException fromJson(dynamic data) {
    if (data is! Map) return fromCode(null);
    return fromCode(data['code']?.toString(), data['message']?.toString());
  }
}
