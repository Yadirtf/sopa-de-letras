import 'package:equatable/equatable.dart';

enum NotificationKind {
  roomInvite,
  friendRequest,
  friendAccepted,
  gameEnd,
  other;

  static NotificationKind parse(String? raw) => switch (raw) {
        'ROOM_INVITE' => NotificationKind.roomInvite,
        'FRIEND_REQUEST' => NotificationKind.friendRequest,
        'FRIEND_ACCEPTED' => NotificationKind.friendAccepted,
        'GAME_END' => NotificationKind.gameEnd,
        _ => NotificationKind.other,
      };
}

/// Notificación in-app (US-25). Se llama "App" para no chocar con
/// la clase Notification de Flutter.
class AppNotificationEntity extends Equatable {
  final String id;
  final NotificationKind kind;
  final Map<String, dynamic> payload;
  final bool isRead;
  final DateTime createdAt;

  const AppNotificationEntity({
    required this.id,
    required this.kind,
    required this.payload,
    required this.isRead,
    required this.createdAt,
  });

  String? text(String key) => payload[key] as String?;
  int? number(String key) => (payload[key] as num?)?.toInt();

  AppNotificationEntity markedRead() =>
      AppNotificationEntity(id: id, kind: kind, payload: payload, isRead: true, createdAt: createdAt);

  @override
  List<Object?> get props => [id, kind, payload, isRead, createdAt];
}

class NotificationPage {
  final List<AppNotificationEntity> items;
  final String? nextCursor;
  final int unreadCount;

  const NotificationPage({required this.items, required this.nextCursor, required this.unreadCount});
}
