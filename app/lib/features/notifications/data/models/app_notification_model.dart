import '../../domain/entities/app_notification_entity.dart';

abstract class AppNotificationModel {
  static AppNotificationEntity fromJson(Map<String, dynamic> json) => AppNotificationEntity(
        id: json['id'] as String,
        kind: NotificationKind.parse(json['type'] as String?),
        payload: Map<String, dynamic>.from(json['payload'] as Map? ?? const {}),
        isRead: json['isRead'] as bool? ?? false,
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal() ?? DateTime.now(),
      );

  static NotificationPage pageFromJson(Map<String, dynamic> json) => NotificationPage(
        items: (json['items'] as List? ?? const [])
            .map((e) => fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        nextCursor: json['nextCursor'] as String?,
        unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
      );
}
