import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/game/domain/entities/game_room_entity.dart';
import 'package:wordhive_app/features/game/domain/entities/room_lobby_entities.dart';
import 'package:wordhive_app/features/game/presentation/providers/game_room_notifier.dart';
import 'fake_game_repository.dart';

Future<void> flush() => Future<void>.delayed(Duration.zero);

void main() {
  late FakeGameRepository repo;
  late GameRoomNotifier notifier;

  setUp(() {
    repo = FakeGameRepository();
    notifier = GameRoomNotifier(repo);
  });

  test('el anfitrion que crea la sala entra por socket y su Iniciar llega al servidor', () async {
    await notifier.createRoom(wordSearchId: 'ws');
    expect(notifier.isJoinedTo('ABC123'), isFalse); // el lobby detecta esto y entra

    await notifier.joinRoom(code: 'abc123', userId: 'host', username: 'Host');
    expect(notifier.isJoinedTo('ABC123'), isTrue);

    notifier.startGame();
    notifier.startGame(); // doble toque: solo se envia una vez
    expect(repo.sent.where((e) => e == 'start:host'), hasLength(1));
    expect(notifier.state.isStarting, isTrue);
  });

  test('marcar y cancelar listo se ve al instante y se envia al servidor', () async {
    repo.joinResult =
        RoomPlayersSnapshot(hostUserId: 'host', players: [fakePlayer('host', host: true), fakePlayer('beto')]);
    await notifier.joinRoom(code: 'ABC123', userId: 'beto', username: 'Beto');

    notifier.toggleReady(true);
    expect(notifier.state.room!.players.last.isReady, isTrue);
    notifier.toggleReady(false);
    expect(notifier.state.room!.players.last.isReady, isFalse);
    expect(repo.sent, containsAllInOrder(['ready:beto:true', 'ready:beto:false']));
  });

  test('la lista que manda el servidor (listo, entra, sale) se aplica tal cual', () async {
    await notifier.joinRoom(code: 'ABC123', userId: 'host', username: 'Host');
    repo.players.add(RoomPlayersSnapshot(
        hostUserId: 'host', players: [fakePlayer('host', host: true), fakePlayer('beto', ready: true)]));
    await flush();
    expect(notifier.state.room!.players.map((p) => p.isReady), [true, true]);
  });

  test('si el servidor rechaza iniciar, se muestra el motivo y se puede reintentar', () async {
    await notifier.joinRoom(code: 'ABC123', userId: 'host', username: 'Host');
    notifier.startGame();
    repo.roomErrors.add(const RoomFlowException('JUGADORES_NO_LISTOS', 'Faltan por estar listos: Beto'));
    await flush();
    expect(notifier.state.errorMessage, contains('Beto'));
    expect(notifier.state.isStarting, isFalse);
  });

  test('la cuenta atras y el inicio llevan la sala a juego', () async {
    await notifier.joinRoom(code: 'ABC123', userId: 'host', username: 'Host');
    notifier.startGame();
    repo.countdown.add({'countdownSeconds': 3});
    await flush();
    expect(notifier.state.countdownValue, 3);
    expect(notifier.state.isStarting, isFalse);

    repo.started.add({
      'grid': [
        ['A']
      ],
      'words': ['A']
    });
    await flush();
    expect(notifier.state.isGameActive, isTrue);
    expect(notifier.state.countdownValue, isNull);
    expect(notifier.state.room!.status, RoomStatusEnum.inProgress);
  });

  test('un error al entrar se explica y no deja la sala como unida', () async {
    repo.joinError = const RoomFlowException('SALA_LLENA', 'La sala está llena');
    await notifier.joinRoom(code: 'ABC123', userId: 'beto', username: 'Beto');
    expect(notifier.state.errorMessage, 'La sala está llena');
    expect(notifier.isJoinedTo('ABC123'), isFalse);
  });

  test('salir limpia la partida anterior para que no se cuele en la siguiente', () async {
    await notifier.joinRoom(code: 'ABC123', userId: 'host', username: 'Host');
    notifier.leaveRoom();
    expect(repo.sent, contains('leave:host'));
    expect(notifier.state.room, isNull);
  });

  test('la revancha devuelve la sala a espera', () async {
    await notifier.joinRoom(code: 'ABC123', userId: 'host', username: 'Host');
    repo.started.add({});
    await flush();
    repo.rematchStarted.add({
      'grid': [
        ['B']
      ],
      'words': ['B']
    });
    await flush();
    expect(notifier.state.room!.status, RoomStatusEnum.waiting);
    expect(notifier.state.isGameActive, isFalse);
    expect(notifier.state.room!.words, ['B']);
  });

  group('LobbyReadiness', () {
    test('el anfitrion puede iniciar solo cuando todos los demas estan listos', () {
      final room = fakeRoom(players: [fakePlayer('host', host: true), fakePlayer('beto')]);
      final host = LobbyReadiness.of(room, 'host');
      expect(host.isHost, isTrue);
      expect(host.everyoneReady, isFalse);
      expect(host.pendingNames, ['BETO']);
      expect(host.readyCount, 1);

      final ready = LobbyReadiness.of(
          fakeRoom(players: [fakePlayer('host', host: true), fakePlayer('beto', ready: true)]), 'host');
      expect(ready.everyoneReady, isTrue);
    });

    test('un invitado ve su propio estado de listo', () {
      final room = fakeRoom(players: [fakePlayer('host', host: true), fakePlayer('beto', ready: true)]);
      final guest = LobbyReadiness.of(room, 'beto');
      expect(guest.isHost, isFalse);
      expect(guest.isReady, isTrue);
    });
  });
}
