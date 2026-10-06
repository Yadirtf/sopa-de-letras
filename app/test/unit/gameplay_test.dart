import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/game/domain/entities/game_event_entities.dart';
import 'package:wordhive_app/features/game/domain/entities/room_lobby_entities.dart';
import 'package:wordhive_app/features/game/presentation/providers/game_board_provider.dart';
import 'package:wordhive_app/features/game/presentation/providers/game_room_notifier.dart';
import 'package:wordhive_app/features/game/presentation/providers/word_attempt.dart';
import 'fake_game_repository.dart';

Future<void> flush() => Future<void>.delayed(Duration.zero);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final grid = [
    ['P', 'E', 'R', 'R', 'O'],
    ['G', 'A', 'T', 'O', 'X'],
    ['A', 'V', 'E', 'S', 'Y'],
    ['X', 'Y', 'Z', 'W', 'K'],
  ];

  group('Seleccion en el tablero', () {
    test('arrastrar celda a celda marca la palabra completa (antes se cortaba en 2 letras)', () {
      final board = GameBoardNotifier()..startSelection(0, 0, grid);
      for (var c = 1; c <= 4; c++) {
        board.updateSelection(0, c, grid);
      }
      expect(board.state.formedWord, 'PERRO');
      expect(board.state.startCell, const CellCoord(0, 0));
    });

    test('un trazo diagonal un poco torcido se imanta a la diagonal', () {
      final board = GameBoardNotifier()..startSelection(0, 0, grid);
      board.updateSelection(1, 1, grid);
      board.updateSelection(2, 1, grid); // el dedo se desvia una columna
      board.updateSelection(3, 3, grid);
      expect(board.state.formedWord, 'PAEW');
    });

    test('volver a la letra inicial deja solo esa letra marcada', () {
      final board = GameBoardNotifier()..startSelection(1, 1, grid);
      board.updateSelection(1, 3, grid);
      board.updateSelection(1, 1, grid);
      expect(board.state.selectedCells, [const CellCoord(1, 1)]);
    });

    test('el trazo no se sale del tablero', () {
      final board = GameBoardNotifier()..startSelection(3, 0, grid);
      board.updateSelection(3, 9, grid);
      expect(board.state.formedWord, 'XYZWK');
    });
  });

  group('WordAttempt', () {
    test('acepta la palabra en ambos sentidos y la devuelve como esta en la lista', () {
      expect(WordAttempt.evaluate('ORREP', ['perro'], const []).word, 'PERRO');
      expect(WordAttempt.evaluate('GATO', ['PERRO'], const []).outcome, WordAttemptOutcome.notInList);
      expect(WordAttempt.evaluate('PERRO', ['PERRO'], ['perro']).outcome, WordAttemptOutcome.alreadyMine);
    });
  });

  group('Partida en el notifier', () {
    late FakeGameRepository repo;
    late GameRoomNotifier notifier;

    setUp(() async {
      repo = FakeGameRepository()
        ..joinResult = RoomPlayersSnapshot(hostUserId: 'host', players: [fakePlayer('host', host: true)]);
      notifier = GameRoomNotifier(repo);
      await notifier.joinRoom(code: 'ABC123', userId: 'host', username: 'Host');
      repo.started.add({
        'grid': grid,
        'words': ['PERRO', 'GATO']
      });
      await flush();
    });

    test('solo se envian trazos que son palabras de la lista', () {
      expect(notifier.submitSelection('XYZ', [3, 0], [3, 2]), WordAttemptOutcome.notInList);
      expect(notifier.submitSelection('ORREP', [0, 4], [0, 0]), WordAttemptOutcome.sent);
      expect(repo.sent, contains('word:PERRO'));
      expect(repo.sent.where((e) => e.startsWith('word:')), hasLength(1));
    });

    test('si el servidor rechaza la palabra se avisa con una frase amable', () async {
      repo.submitError = 'PALABRA_YA_ENCONTRADA';
      notifier.submitSelection('PERRO', [0, 0], [0, 4]);
      await flush();
      expect(notifier.state.errorMessage, 'Ya habías encontrado esa palabra');
    });

    test('una palabra encontrada mueve la carrera y queda pintada', () async {
      repo.wordFound.add(const WordFoundEventEntity(
        word: 'PERRO',
        claimedByUserId: 'host',
        claimedByUsername: 'HOST',
        colorHex: '#7C3AED',
        pointsAwarded: 50,
        newScore: 50,
        start: [0, 0],
        end: [0, 4],
      ));
      await flush();
      final me = notifier.state.room!.players.single;
      expect(me.score, 50);
      expect(me.wordsFound, ['PERRO']);
      expect(notifier.state.claimedWords['PERRO']!.end, [0, 4]);
    });

    test('perder el internet no saca al jugador: solo muestra que reconecta', () async {
      repo.connection.add(false);
      await flush();
      expect(notifier.state.isConnected, isFalse);
      expect(notifier.state.room, isNotNull);
      expect(repo.sent.where((e) => e.startsWith('leave')), isEmpty);
      repo.connection.add(true);
      await flush();
      expect(notifier.state.isConnected, isTrue);
    });

    test('las palabras del oponente no se pintan en mi sopa, solo cuenta su avance', () async {
      repo.wordFound.add(const WordFoundEventEntity(
        word: 'GATO',
        claimedByUserId: 'ana',
        claimedByUsername: 'Ana',
        colorHex: '#06B6D4',
        pointsAwarded: 40,
        newScore: 40,
        start: [1, 0],
        end: [1, 3],
      ));
      await flush();
      expect(notifier.state.claimedWords, isEmpty);
    });
  });
}
