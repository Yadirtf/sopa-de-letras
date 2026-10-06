import 'package:equatable/equatable.dart';

/// Estado de presencia de un amigo (US-23).
enum PresenceStatus {
  online,
  playing,
  offline;

  static PresenceStatus parse(String? raw) => switch (raw) {
        'ONLINE' => PresenceStatus.online,
        'PLAYING' => PresenceStatus.playing,
        _ => PresenceStatus.offline,
      };

  bool get isAvailable => this != PresenceStatus.offline;
}

/// Relación con un jugador encontrado en el buscador (US-22).
enum RelationStatus {
  none,
  friends,
  requestSent,
  requestReceived;

  static RelationStatus parse(String? raw) => switch (raw) {
        'FRIENDS' => RelationStatus.friends,
        'REQUEST_SENT' => RelationStatus.requestSent,
        'REQUEST_RECEIVED' => RelationStatus.requestReceived,
        _ => RelationStatus.none,
      };
}

class PlayerProfileEntity extends Equatable {
  final String id;
  final String name;
  final String? avatarUrl;

  const PlayerProfileEntity({required this.id, required this.name, this.avatarUrl});

  @override
  List<Object?> get props => [id, name, avatarUrl];
}

class FriendEntity extends PlayerProfileEntity {
  final PresenceStatus status;
  final DateTime friendsSince;

  const FriendEntity({
    required super.id,
    required super.name,
    super.avatarUrl,
    required this.status,
    required this.friendsSince,
  });

  FriendEntity withStatus(PresenceStatus next) =>
      FriendEntity(id: id, name: name, avatarUrl: avatarUrl, status: next, friendsSince: friendsSince);

  @override
  List<Object?> get props => [...super.props, status, friendsSince];
}

class PlayerSearchResultEntity extends PlayerProfileEntity {
  final RelationStatus relation;

  const PlayerSearchResultEntity({required super.id, required super.name, super.avatarUrl, required this.relation});

  PlayerSearchResultEntity withRelation(RelationStatus next) =>
      PlayerSearchResultEntity(id: id, name: name, avatarUrl: avatarUrl, relation: next);

  @override
  List<Object?> get props => [...super.props, relation];
}

class FriendRequestEntity extends Equatable {
  final String id;
  final DateTime createdAt;
  final PlayerProfileEntity player;

  const FriendRequestEntity({required this.id, required this.createdAt, required this.player});

  @override
  List<Object?> get props => [id, createdAt, player];
}

/// Resultado de "Agregar": `accepted` cuando la otra persona ya nos había agregado.
enum FriendRequestOutcome { pending, accepted }
