import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/notifications_notifier.dart';

/// Campana con contador de no leídas (US-25 / RF-30). Se mueve un poco
/// cuando llega algo nuevo para atraer la mirada sin sonar a alarma.
class NotificationBellButton extends ConsumerWidget {
  const NotificationBellButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unread = ref.watch(notificationsNotifierProvider.select((s) => s.unreadCount));

    return IconButton(
      tooltip: unread == 0 ? 'Notificaciones' : 'Notificaciones: $unread sin leer',
      onPressed: () => context.go('/notifications'),
      icon: TweenAnimationBuilder<double>(
        key: ValueKey(unread),
        tween: Tween(begin: unread > 0 ? 1 : 0, end: 0),
        duration: const Duration(milliseconds: 700),
        curve: Curves.elasticOut,
        builder: (_, shake, child) => Transform.rotate(angle: shake * 0.4, child: child),
        child: Badge(
          isLabelVisible: unread > 0,
          backgroundColor: AppColors.accentRose,
          label: Text(unread > 99 ? '99+' : '$unread'),
          child: Icon(
            unread > 0 ? Icons.notifications_active_rounded : Icons.notifications_none_rounded,
            color: unread > 0 ? AppColors.accentAmber : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
