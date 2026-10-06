import '../../domain/entities/app_notification_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../datasources/notification_remote_datasource.dart';
import '../models/app_notification_model.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource _remote;

  NotificationRepositoryImpl(this._remote);

  @override
  Future<NotificationPage> fetchPage({String? cursor}) async =>
      AppNotificationModel.pageFromJson(await _remote.list(cursor: cursor));

  @override
  Future<int> markRead(String id) async => ((await _remote.markRead(id))['unreadCount'] as num?)?.toInt() ?? 0;

  @override
  Future<void> markAllRead() => _remote.markAllRead();
}
