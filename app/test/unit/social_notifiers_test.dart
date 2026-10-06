import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:wordhive_app/features/notifications/domain/entities/app_notification_entity.dart';
import 'package:wordhive_app/features/notifications/domain/repositories/notification_repository.dart';
import 'package:wordhive_app/features/notifications/presentation/providers/notifications_notifier.dart';
import 'package:wordhive_app/features/social/domain/entities/social_entities.dart';
import 'package:wordhive_app/features/social/domain/repositories/social_repository.dart';
import 'package:wordhive_app/features/social/presentation/providers/friends_notifier.dart';
import 'package:wordhive_app/features/social/presentation/providers/player_search_notifier.dart';

class MockSocialRepository extends Mock implements SocialRepository {}

class MockNotificationRepository extends Mock implements NotificationRepository {}

FriendEntity friend(String id, String name, PresenceStatus status) =>
    FriendEntity(id: id, name: name, status: status, friendsSince: DateTime(2026));

void main() {
  group('FriendsNotifier', () {
    late MockSocialRepository repo;
    late FriendsNotifier notifier;

    setUp(() {
      repo = MockSocialRepository();
      when(() => repo.getFriends()).thenAnswer((_) async => [
            friend('b', 'Beto', PresenceStatus.offline),
            friend('a', 'Ana', PresenceStatus.online),
          ]);
      when(() => repo.getRequests()).thenAnswer((_) async => (incoming: <FriendRequestEntity>[], outgoing: <FriendRequestEntity>[]));
      notifier = FriendsNotifier(repo);
    });

    test('carga amigos con los conectados primero', () async {
      await notifier.load();
      expect(notifier.state.friends.map((f) => f.name), ['Ana', 'Beto']);
      expect(notifier.state.availableCount, 1);
    });

    test('la presencia en tiempo real reordena la lista', () async {
      await notifier.load();
      notifier.applyPresence('b', PresenceStatus.online);
      notifier.applyPresence('a', PresenceStatus.offline);
      expect(notifier.state.friends.first.name, 'Beto');
    });

    test('aceptar recarga y devuelve un mensaje de celebración', () async {
      when(() => repo.acceptRequest('r1')).thenAnswer((_) async {});
      final message = await notifier.accept('r1');
      expect(message, contains('amigos'));
      verify(() => repo.getFriends()).called(1);
      expect(notifier.state.busyIds, isEmpty);
    });
  });

  group('PlayerSearchNotifier', () {
    test('no busca con menos de 2 letras y marca la solicitud enviada', () async {
      final repo = MockSocialRepository();
      when(() => repo.searchPlayers('an')).thenAnswer(
          (_) async => [const PlayerSearchResultEntity(id: 'x', name: 'Ana', relation: RelationStatus.none)]);
      when(() => repo.sendRequest('x')).thenAnswer((_) async => FriendRequestOutcome.pending);
      final notifier = PlayerSearchNotifier(repo, debounce: Duration.zero);

      notifier.onQueryChanged('a');
      expect(notifier.state.isTooShort, isTrue);
      verifyNever(() => repo.searchPlayers(any()));

      notifier.onQueryChanged('an');
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(notifier.state.results.single.name, 'Ana');

      final message = await notifier.add('x');
      expect(message, contains('enviada'));
      expect(notifier.state.results.single.relation, RelationStatus.requestSent);
    });
  });

  group('NotificationsNotifier', () {
    late MockNotificationRepository repo;
    late NotificationsNotifier notifier;

    setUp(() {
      repo = MockNotificationRepository();
      notifier = NotificationsNotifier(repo);
    });

    test('una notificación por socket entra arriba y actualiza el badge', () {
      notifier.onRealtime({
        'notification': {'id': 'n1', 'type': 'FRIEND_REQUEST', 'payload': {'fromName': 'Ana'}, 'isRead': false},
        'unreadCount': 4,
      });
      expect(notifier.state.items.single.kind, NotificationKind.friendRequest);
      expect(notifier.state.unreadCount, 4);
    });

    test('marcar como leída es optimista y confirma con el servidor', () async {
      when(() => repo.markRead('n1')).thenAnswer((_) async => 0);
      notifier.onRealtime({
        'notification': {'id': 'n1', 'type': 'GAME_END', 'payload': {}, 'isRead': false},
        'unreadCount': 1,
      });
      await notifier.markRead('n1');
      expect(notifier.state.items.single.isRead, isTrue);
      expect(notifier.state.unreadCount, 0);
    });

    test('leer todo deja el contador en cero', () async {
      when(() => repo.markAllRead()).thenAnswer((_) async {});
      notifier.onRealtime({
        'notification': {'id': 'n1', 'type': 'GAME_END', 'payload': {}, 'isRead': false},
        'unreadCount': 7,
      });
      await notifier.markAllRead();
      expect(notifier.state.unreadCount, 0);
      expect(notifier.state.items.every((n) => n.isRead), isTrue);
    });
  });
}
