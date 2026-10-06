import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../social/presentation/providers/room_invite_actions.dart';
import '../../../social/presentation/widgets/social_empty_state_widget.dart';
import '../../domain/entities/app_notification_entity.dart';
import '../providers/notifications_notifier.dart';
import '../widgets/notification_card_widget.dart';

/// Centro de notificaciones (US-25): historial, "marcar todo como leído"
/// y una acción directa por tarjeta (ver solicitud, unirse a la sala...).
class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(notificationsNotifierProvider.notifier).refresh());
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 200) {
        ref.read(notificationsNotifierProvider.notifier).loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  String? _actionLabel(NotificationKind kind) => switch (kind) {
        NotificationKind.friendRequest => 'Responder',
        NotificationKind.friendAccepted => 'Ver amigos',
        NotificationKind.roomInvite => 'Unirme',
        _ => null,
      };

  Future<void> _open(AppNotificationEntity n) async {
    ref.read(notificationsNotifierProvider.notifier).markRead(n.id);
    switch (n.kind) {
      case NotificationKind.friendRequest:
        context.push('/friends', extra: {'tab': 1});
      case NotificationKind.friendAccepted:
        context.push('/friends');
      case NotificationKind.roomInvite:
        final code = n.text('roomCode');
        if (code == null) return;
        final error = await joinInvitedRoom(ref, code);
        if (error != null && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
        }
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsNotifierProvider);
    final notifier = ref.read(notificationsNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Notificaciones', style: AppTypography.heading2.copyWith(fontSize: 20)),
        actions: [
          if (state.unreadCount > 0)
            TextButton.icon(
              onPressed: notifier.markAllRead,
              icon: const Icon(Icons.done_all_rounded, size: 18, color: AppColors.accentCyan),
              label: const Text('Leer todo', style: TextStyle(color: AppColors.accentCyan)),
            ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
          : state.items.isEmpty
              ? const SocialEmptyState(
                  icon: Icons.notifications_none_rounded,
                  title: 'Todo tranquilo por aquí',
                  message: 'Aquí verás solicitudes de amistad, invitaciones a jugar y tus medallas.',
                )
              : RefreshIndicator(
                  color: AppColors.accentCyan,
                  backgroundColor: AppColors.bgCard,
                  onRefresh: notifier.refresh,
                  child: ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemCount: state.items.length + (state.isLoadingMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == state.items.length) {
                        return const Padding(
                          padding: EdgeInsets.all(16),
                          child: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
                        );
                      }
                      final n = state.items[index];
                      return NotificationCard(
                        key: ValueKey(n.id),
                        notification: n,
                        actionLabel: _actionLabel(n.kind),
                        onTap: () => _open(n),
                      );
                    },
                  ),
                ),
    );
  }
}
