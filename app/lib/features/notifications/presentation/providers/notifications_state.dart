import 'package:equatable/equatable.dart';
import '../../domain/entities/app_notification_entity.dart';

class NotificationsState extends Equatable {
  final List<AppNotificationEntity> items;
  final int unreadCount;
  final String? nextCursor;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasLoaded;

  const NotificationsState({
    this.items = const [],
    this.unreadCount = 0,
    this.nextCursor,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasLoaded = false,
  });

  bool get hasMore => nextCursor != null;

  NotificationsState copyWith({
    List<AppNotificationEntity>? items,
    int? unreadCount,
    String? Function()? nextCursor,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasLoaded,
  }) {
    return NotificationsState(
      items: items ?? this.items,
      unreadCount: unreadCount ?? this.unreadCount,
      nextCursor: nextCursor != null ? nextCursor() : this.nextCursor,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasLoaded: hasLoaded ?? this.hasLoaded,
    );
  }

  @override
  List<Object?> get props => [items, unreadCount, nextCursor, isLoading, isLoadingMore, hasLoaded];
}
