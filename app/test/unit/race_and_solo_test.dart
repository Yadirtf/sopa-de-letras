import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/game/domain/entities/game_event_entities.dart';
import 'package:wordhive_app/features/game/domain/entities/game_room_entity.dart';
import 'package:wordhive_app/features/game/presentation/providers/game_room_notifier.dart';
import 'package:wordhive_app/features/game/presentation/providers/race_standings.dart';
import 'package:wordhive_app/features/game/presentation/providers/solo_game_launcher.dart';
import 'fake_game_repository.dart';

RoomPlayerEntity racer(String id, int score, int words, {bool online = true}) => fakePlayer(id).copyWith(
      score: score,
      wordsFound: List.generate(words, (i) => 'W$i'),
      isConnected: online,
    );

void main() {
  group('Carrera de oponentes', () {
    test('ordena por puntos y corona al lider solo si va solo adelante', () {
      final standings = computeRaceStandings([racer('ana', 10, 1), racer('yo', 30, 2), racer('beto', 0, 0)], 'yo');
      expect(standings.map((s) => s.userId), ['yo', 'ana', 'beto']);
      expect(standings.first.isLeader, isTrue);
      expect(raceHeadline(standings), contains('Vas ganando'));

      final tied = computeRaceStandings([racer('ana', 10, 1), racer('yo', 10, 1)], 'yo');
      expect(tied.any((s) => s.isLeader), isFalse);
      expect(tied.map((s) => s.place), [1, 1]);
      expect(raceHeadline(tied), contains('Empate'));
    });

    test('dice quien va adelante y en que puesto voy', () {
      final standings = computeRaceStandings([racer('ana', 20, 2), racer('yo', 10, 1, online: false)], 'yo');
      expect(raceHeadline(standings), 'ANA va adelante · tú vas de 2º');
      expect(standings.last.isConnected, isFalse);
    });
  });

  test('la carrera toma el avance del oponente del marcador, sin saber sus palabras', () {
    const board = [
      LeaderboardEntryEntity(
          rank: 1, userId: 'ana', username: 'ANA', colorHex: '#06B6D4', score: 40, wordsCount: 2, progressPercent: 50),
    ];
    final standings = computeRaceStandings([racer('ana', 0, 0), racer('yo', 10, 1)], 'yo', board);
    expect(standings.first.userId, 'ana');
    expect(standings.first.wordsCount, 2);
    expect(standings.first.isLeader, isTrue);
  });

  test('el modo solitario crea una sala privada, entra y arranca sin lobby', () async {
    final repo = FakeGameRepository();
    final notifier = GameRoomNotifier(repo);
    final code = await SoloGameLauncher(notifier, () => notifier.state)
        .launch(wordSearchId: 'ws', userId: 'host', username: 'Host');
    expect(code, 'ABC123');
    expect(repo.sent, ['join:host', 'start:host']);
  });
}
