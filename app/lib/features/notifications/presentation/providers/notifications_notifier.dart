import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../data/datasources/notification_remote_datasource.dart';
import '../../data/models/app_notification_model.dart';
import '../../data/repositories/notification_repository_impl.dart';
import '../../domain/repositories/notification_repository.dart';
import 'notifications_state.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepositoryImpl(NotificationRemoteDataSource(ApiClient()));
});

final notificationsNotifierProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  return NotificationsNotifier(ref.watch(notificationRepositoryProvider));
});

/// Campana + centro de notificaciones (US-25).
/// El contador se actualiza por socket (`notification:new`), así el badge
/// cambia al instante aunque la pantalla de notificaciones esté cerrada.
class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationRepository _repo;

  NotificationsNotifier(this._repo) : super(const NotificationsState());

  Future<void> refresh() async {
    state = state.copyWith(isLoading: !state.hasLoaded);
    try {
      final page = await _repo.fetchPage();
      state = state.copyWith(
        items: page.items,
        unreadCount: page.unreadCount,
        nextCursor: () => page.nextCursor,
        isLoading: false,
        hasLoaded: true,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false, hasLoaded: true);
    }
  }

  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final page = await _repo.fetchPage(cursor: state.nextCursor);
      state = state.copyWith(
        items: [...state.items, ...page.items],
        unreadCount: page.unreadCount,
        nextCursor: () => page.nextCursor,
        isLoadingMore: false,
      );
    } catch (_) {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  /// Evento `notification:new` = { notification, unreadCount }.
  void onRealtime(Map<String, dynamic> event) {
    final raw = event['notification'];
    if (raw is! Map) return;
    final incoming = AppNotificationModel.fromJson(Map<String, dynamic>.from(raw));
    state = state.copyWith(
      items: [incoming, ...state.items.where((n) => n.id != incoming.id)],
      unreadCount: (event['unreadCount'] as num?)?.toInt() ?? state.unreadCount + 1,
    );
  }

  Future<void> markRead(String id) async {
    final target = state.items.where((n) => n.id == id).firstOrNull;
    if (target == null || target.isRead) return;
    // Optimista: la tarjeta se apaga al toque, el servidor confirma el contador.
    state = state.copyWith(
      items: state.items.map((n) => n.id == id ? n.markedRead() : n).toList(),
      unreadCount: (state.unreadCount - 1).clamp(0, 1 << 30),
    );
    try {
      final unread = await _repo.markRead(id);
      state = state.copyWith(unreadCount: unread);
    } catch (_) {
      // Si falla, el siguiente refresh corrige el contador.
    }
  }

  Future<void> markAllRead() async {
    state = state.copyWith(items: state.items.map((n) => n.markedRead()).toList(), unreadCount: 0);
    try {
      await _repo.markAllRead();
    } catch (_) {
      await refresh();
    }
  }

  void reset() => state = const NotificationsState();
}
