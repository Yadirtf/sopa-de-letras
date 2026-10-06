import '../../domain/entities/social_entities.dart';

/// Parsers JSON del módulo social. Tolerantes a campos nulos para que un
/// cambio menor en la API nunca deje la pantalla de amigos en blanco.
abstract class SocialModels {
  static PlayerProfileEntity profile(Map<String, dynamic> json) => PlayerProfileEntity(
        id: json['id'] as String,
        name: json['name'] as String? ?? 'Jugador',
        avatarUrl: json['avatarUrl'] as String?,
      );

  static FriendEntity friend(Map<String, dynamic> json) => FriendEntity(
        id: json['id'] as String,
        name: json['name'] as String? ?? 'Jugador',
        avatarUrl: json['avatarUrl'] as String?,
        status: PresenceStatus.parse(json['status'] as String?),
        friendsSince: DateTime.tryParse(json['friendsSince'] as String? ?? '') ?? DateTime.now(),
      );

  static PlayerSearchResultEntity searchResult(Map<String, dynamic> json) => PlayerSearchResultEntity(
        id: json['id'] as String,
        name: json['name'] as String? ?? 'Jugador',
        avatarUrl: json['avatarUrl'] as String?,
        relation: RelationStatus.parse(json['relation'] as String?),
      );

  static FriendRequestEntity request(Map<String, dynamic> json) => FriendRequestEntity(
        id: json['id'] as String,
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
        player: profile(Map<String, dynamic>.from(json['player'] as Map)),
      );

  static List<T> list<T>(dynamic raw, T Function(Map<String, dynamic>) parse) =>
      (raw as List? ?? const []).map((e) => parse(Map<String, dynamic>.from(e as Map))).toList();
}
