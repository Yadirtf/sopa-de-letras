import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/app_notification_entity.dart';

/// Texto, emoji y color de cada notificación. Frases cortas, en segunda
/// persona y con emoji: se entienden de un vistazo a cualquier edad.
class NotificationCopy {
  final String emoji;
  final Color color;
  final String title;
  final String body;

  const NotificationCopy({required this.emoji, required this.color, required this.title, required this.body});

  factory NotificationCopy.of(AppNotificationEntity n) {
    final title = n.text('wordSearchTitle') ?? 'una sopa de letras';
    return switch (n.kind) {
      NotificationKind.friendRequest => NotificationCopy(
          emoji: '👋',
          color: AppColors.accentCyan,
          title: 'Nueva solicitud de amistad',
          body: '${n.text('fromName') ?? 'Alguien'} quiere ser tu amigo',
        ),
      NotificationKind.friendAccepted => NotificationCopy(
          emoji: '🤝',
          color: AppColors.accentEmerald,
          title: '¡Tienes un nuevo amigo!',
          body: '${n.text('friendName') ?? 'Tu amigo'} aceptó tu solicitud',
        ),
      NotificationKind.roomInvite => NotificationCopy(
          emoji: '🎮',
          color: AppColors.accentViolet,
          title: 'Invitación a jugar',
          body: '${n.text('fromName') ?? 'Un amigo'} te invitó a «$title»',
        ),
      NotificationKind.gameEnd => NotificationCopy(
          emoji: _medal(n.number('rank')),
          color: AppColors.accentAmber,
          title: '¡Quedaste en el puesto ${n.number('rank') ?? '-'}!',
          body: 'En «$title» ganaste ${n.number('trophiesEarned') ?? 0} trofeos',
        ),
      NotificationKind.other => const NotificationCopy(
          emoji: '🔔', color: AppColors.accentCyan, title: 'Novedad', body: 'Tienes algo nuevo en WordHive'),
    };
  }

  static String _medal(int? rank) => switch (rank) { 1 => '🥇', 2 => '🥈', 3 => '🥉', _ => '🏆' };
}

/// "hace 5 min", "ayer"... más humano que una fecha completa.
String relativeTime(DateTime date, {DateTime? now}) {
  final diff = (now ?? DateTime.now()).difference(date);
  if (diff.inMinutes < 1) return 'ahora';
  if (diff.inMinutes < 60) return 'hace ${diff.inMinutes} min';
  if (diff.inHours < 24) return 'hace ${diff.inHours} h';
  if (diff.inDays == 1) return 'ayer';
  if (diff.inDays < 7) return 'hace ${diff.inDays} días';
  return '${date.day}/${date.month}/${date.year}';
}
