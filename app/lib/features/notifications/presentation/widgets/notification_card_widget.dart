import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/app_notification_entity.dart';
import 'notification_copy.dart';

/// Tarjeta del centro de notificaciones. Las no leídas brillan con el
/// color de su tipo y llevan un punto; al tocarlas se apagan.
class NotificationCard extends StatelessWidget {
  final AppNotificationEntity notification;
  final VoidCallback onTap;
  final String? actionLabel;

  const NotificationCard({super.key, required this.notification, required this.onTap, this.actionLabel});

  @override
  Widget build(BuildContext context) {
    final copy = NotificationCopy.of(notification);
    final unread = !notification.isRead;

    return Semantics(
      button: true,
      label: '${unread ? 'Sin leer. ' : ''}${copy.title}. ${copy.body}',
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Material(
          color: unread ? copy.color.withValues(alpha: 0.08) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(18),
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: unread ? copy.color.withValues(alpha: 0.5) : AppColors.borderSubtle),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: copy.color.withValues(alpha: 0.15), shape: BoxShape.circle),
                    child: Text(copy.emoji, style: const TextStyle(fontSize: 24)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(copy.title, style: AppTypography.labelBold.copyWith(fontSize: 15)),
                        const SizedBox(height: 2),
                        Text(copy.body, style: AppTypography.bodyMedium),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Text(relativeTime(notification.createdAt), style: AppTypography.caption),
                            const Spacer(),
                            if (actionLabel != null)
                              Text('$actionLabel ›', style: AppTypography.labelBold.copyWith(color: copy.color, fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  if (unread)
                    Container(
                      margin: const EdgeInsets.only(left: 8, top: 4),
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(color: copy.color, shape: BoxShape.circle),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
