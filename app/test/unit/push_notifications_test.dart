import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:wordhive_app/core/push/push_messaging.dart';
import 'package:wordhive_app/features/notifications/data/datasources/push_device_remote_datasource.dart';
import 'package:wordhive_app/features/notifications/presentation/providers/push_device_registrar.dart';
import 'package:wordhive_app/features/notifications/presentation/widgets/local_push_fallback.dart';

class _MockPush extends Mock implements PushMessaging {}

class _MockApi extends Mock implements PushDeviceRemoteDataSource {}

Map<String, dynamic> _event(String type, Map<String, dynamic> payload) => {
      'notification': {
        'id': 'n1',
        'type': type,
        'payload': payload,
        'isRead': false,
        'createdAt': '2026-10-06T10:00:00.000Z',
      },
      'unreadCount': 1,
    };

void main() {
  group('Aviso local de respaldo (sin Firebase)', () {
    test('una invitación usa el mismo tag que el push del backend y lleva los datos para unirse', () {
      final local = localPushFor(_event('ROOM_INVITE', {'roomCode': 'ABC123', 'fromName': 'Beto', 'wordSearchTitle': 'Animales'}));

      expect(local!.tag, 'invite-ABC123');
      expect(local.title, 'Invitación a jugar');
      expect(local.body, contains('Beto'));
      expect(local.data, containsPair('type', 'ROOM_INVITE'));
      expect(local.data, containsPair('roomCode', 'ABC123'));
      expect(local.data, containsPair('notificationId', 'n1'));
    });

    test('una solicitud de amistad también sale a la barra', () {
      final local = localPushFor(_event('FRIEND_REQUEST', {'fromName': 'Ana', 'fromUserId': 'u-ana'}));
      expect(local!.tag, 'friend-request-u-ana');
      expect(local.body, 'Ana quiere ser tu amigo');
    });

    test('también avisa cuando aceptan tu solicitud', () {
      final local = localPushFor(_event('FRIEND_ACCEPTED', {'friendName': 'Beto', 'friendId': 'u-beto'}));
      expect(local!.tag, 'friend-accepted-u-beto');
      expect(local.data, containsPair('type', 'FRIEND_ACCEPTED'));
    });

    test('las medallas y eventos informativos se quedan solo en la campana', () {
      expect(localPushFor(_event('GAME_END', {'rank': 1})), isNull);
      expect(localPushFor({'notification': 'roto'}), isNull);
    });
  });

  group('Registro del teléfono en el backend', () {
    late _MockPush push;
    late _MockApi api;
    late PushDeviceRegistrar registrar;

    setUp(() {
      push = _MockPush();
      api = _MockApi();
      when(() => push.token()).thenAnswer((_) async => 'fcm-token');
      when(() => api.register(any())).thenAnswer((_) async {});
      when(() => api.unregister(any(), accessToken: any(named: 'accessToken'))).thenAnswer((_) async {});
      registrar = PushDeviceRegistrar(push, api, readAccessToken: () async => 'jwt-ana');
    });

    test('al iniciar sesión registra el token del teléfono', () async {
      await registrar.signIn('ana');
      expect(registrar.userId, 'ana');
      verify(() => api.register('fcm-token')).called(1);
    });

    test('al cerrar sesión lo da de baja con el JWT que tenía el usuario', () async {
      await registrar.signIn('ana');
      await registrar.signOut();
      expect(registrar.userId, isNull);
      verify(() => api.unregister('fcm-token', accessToken: 'jwt-ana')).called(1);
    });

    test('sin Firebase (sin token) no llama al backend', () async {
      when(() => push.token()).thenAnswer((_) async => null);
      await registrar.signIn('ana');
      await registrar.signOut();
      verifyNever(() => api.register(any()));
      verifyNever(() => api.unregister(any(), accessToken: any(named: 'accessToken')));
    });

    test('un error de red no rompe el inicio de sesión', () async {
      when(() => api.register(any())).thenThrow(Exception('sin red'));
      await expectLater(registrar.signIn('ana'), completes);
    });

    test('si cambia el token se vuelve a registrar', () async {
      await registrar.signIn('ana');
      await registrar.register(token: 'nuevo-token');
      verify(() => api.register('nuevo-token')).called(1);
    });
  });
}
