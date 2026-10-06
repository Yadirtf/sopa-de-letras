import '../../data/models/app_notification_model.dart';
import '../../domain/entities/app_notification_entity.dart';
import 'notification_copy.dart';

/// Aviso local equivalente al push que enviaría el backend.
class LocalPush {
  final String title;
  final String body;
  final String tag;
  final Map<String, dynamic> data;

  const LocalPush({required this.title, required this.body, required this.tag, required this.data});
}

/// Convierte un `notification:new` del socket en aviso para la barra, solo
/// para lo social (invitaciones y amistades). El `tag` coincide
/// con el del backend para que nunca se dupliquen.
LocalPush? localPushFor(Map<String, dynamic> event) {
  final raw = event['notification'];
  if (raw is! Map) return null;
  final n = AppNotificationModel.fromJson(Map<String, dynamic>.from(raw));
  final tag = switch (n.kind) {
    NotificationKind.roomInvite => 'invite-${n.text('roomCode') ?? ''}',
    NotificationKind.friendRequest => 'friend-request-${n.text('fromUserId') ?? ''}',
    NotificationKind.friendAccepted => 'friend-accepted-${n.text('friendId') ?? ''}',
    _ => null,
  };
  if (tag == null) return null;
  final copy = NotificationCopy.of(n);
  return LocalPush(
    title: copy.title,
    body: copy.body,
    tag: tag,
    data: {...n.payload, 'type': raw['type'], 'notificationId': n.id},
  );
}
