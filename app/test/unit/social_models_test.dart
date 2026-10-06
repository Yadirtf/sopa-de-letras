import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/social/data/models/social_models.dart';
import 'package:wordhive_app/features/social/domain/entities/room_invite_entity.dart';
import 'package:wordhive_app/features/social/domain/entities/social_entities.dart';
import 'package:wordhive_app/features/notifications/data/models/app_notification_model.dart';
import 'package:wordhive_app/features/notifications/domain/entities/app_notification_entity.dart';
import 'package:wordhive_app/features/notifications/presentation/widgets/notification_copy.dart';

void main() {
  group('SocialModels', () {
    test('parsea amigo con presencia', () {
      final friend = SocialModels.friend({
        'id': 'u1',
        'name': 'Ana',
        'avatarUrl': 'bee_queen',
        'status': 'PLAYING',
        'friendsSince': '2026-10-01T10:00:00.000Z',
      });
      expect(friend.status, PresenceStatus.playing);
      expect(friend.status.isAvailable, isTrue);
      expect(friend.friendsSince.year, 2026);
    });

    test('estado o relación desconocidos caen en valores seguros', () {
      expect(PresenceStatus.parse('???'), PresenceStatus.offline);
      expect(RelationStatus.parse(null), RelationStatus.none);
      expect(SocialModels.searchResult({'id': 'x', 'relation': 'REQUEST_RECEIVED'}).relation, RelationStatus.requestReceived);
    });

    test('parsea solicitudes con su jugador', () {
      final list = SocialModels.list([
        {'id': 'r1', 'createdAt': '2026-10-01T00:00:00Z', 'player': {'id': 'b', 'name': 'Beto', 'avatarUrl': null}},
      ], SocialModels.request);
      expect(list.single.player.name, 'Beto');
    });
  });

  group('RoomInviteEntity', () {
    test('calcula los segundos restantes sin bajar de cero', () {
      final now = DateTime(2026, 10, 6, 12);
      final invite = RoomInviteEntity.fromJson({
        'roomCode': 'hive42',
        'fromName': 'Ana',
        'expiresAt': now.add(const Duration(milliseconds: 14200)).millisecondsSinceEpoch,
      });
      expect(invite.roomCode, 'HIVE42');
      expect(invite.secondsLeft(now), 15);
      expect(invite.secondsLeft(now.add(const Duration(seconds: 30))), 0);
    });
  });

  group('Notificaciones', () {
    final json = {
      'id': 'n1',
      'type': 'GAME_END',
      'payload': {'rank': 1, 'trophiesEarned': 45, 'wordSearchTitle': 'Animales'},
      'isRead': false,
      'createdAt': '2026-10-06T12:00:00.000Z',
    };

    test('parsea página con contador', () {
      final page = AppNotificationModel.pageFromJson({'items': [json], 'nextCursor': 'n1', 'unreadCount': 3});
      expect(page.items.single.kind, NotificationKind.gameEnd);
      expect(page.unreadCount, 3);
      expect(page.nextCursor, 'n1');
    });

    test('genera textos amables por tipo', () {
      final copy = NotificationCopy.of(AppNotificationModel.fromJson(json));
      expect(copy.emoji, '🥇');
      expect(copy.title, contains('1'));
      expect(copy.body, contains('45 trofeos'));

      final invite = NotificationCopy.of(AppNotificationModel.fromJson({
        'id': 'n2',
        'type': 'ROOM_INVITE',
        'payload': {'fromName': 'Beto', 'wordSearchTitle': 'Frutas'},
      }));
      expect(invite.body, 'Beto te invitó a «Frutas»');
    });

    test('tiempo relativo legible', () {
      final now = DateTime(2026, 10, 6, 12);
      expect(relativeTime(now.subtract(const Duration(seconds: 10)), now: now), 'ahora');
      expect(relativeTime(now.subtract(const Duration(minutes: 5)), now: now), 'hace 5 min');
      expect(relativeTime(now.subtract(const Duration(days: 1)), now: now), 'ayer');
    });
  });
}
