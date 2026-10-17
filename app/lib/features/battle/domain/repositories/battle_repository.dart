import '../entities/battle_catalog.dart';
import '../entities/battle_config.dart';
import '../entities/battle_view.dart';

/// Ubicación de una figura que manda el jugador al terminar de colocar.
class UnitPlacement {
  final String typeId;
  final int col;
  final int row;
  final bool rotated;

  const UnitPlacement({required this.typeId, required this.col, required this.row, this.rotated = false});

  UnitPlacement copyWith({int? col, int? row, bool? rotated}) =>
      UnitPlacement(typeId: typeId, col: col ?? this.col, row: row ?? this.row, rotated: rotated ?? this.rotated);

  Map<String, dynamic> toJson() => {'typeId': typeId, 'col': col, 'row': row, 'rotated': rotated};
}

/// Cambio que llega por socket: la vista nueva y, si hubo, el disparo que la causó.
class BattleUpdate {
  final BattleView view;
  final ShotReportView? shot;
  const BattleUpdate(this.view, this.shot);
}

/// Reacción que llega por socket.
class BattleReactionEvent {
  final String fromUserId;
  final String reactionId;
  const BattleReactionEvent(this.fromUserId, this.reactionId);
}

/// Error de la batalla con texto amable para mostrar tal cual.
class BattleFailure implements Exception {
  final String code;
  final String message;
  const BattleFailure(this.code, this.message);

  @override
  String toString() => message;
}

abstract class BattleRepository {
  Future<BattleCatalog> catalog();
  Future<Map<String, int>> recommendation({required String terrainId, required int cols, required int rows});
  Future<String> createRoom(BattleConfig config);

  Stream<BattleUpdate> get updates;

  /// Reacciones que manda el rival (o la Abejita).
  Stream<BattleReactionEvent> get reactions;
  Future<void> react(String code, String reactionId);
  Stream<bool> get connection;
  Future<BattleView> join(String code);
  Future<List<UnitPlacement>> randomLayout(String code);
  Future<void> place(String code, List<UnitPlacement> units);
  Future<ShotReportView> shoot(String code, {required String weapon, required int col, required int row});
  Future<void> rematch(String code);
  Future<void> leave(String code);
  void disconnect();
}
