import '../entities/app_notification_entity.dart';

abstract class NotificationRepository {
  Future<NotificationPage> fetchPage({String? cursor});
  Future<int> markRead(String id);
  Future<void> markAllRead();
}
