import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/core/widgets/avatar_view.dart';
import 'package:wordhive_app/features/game/domain/entities/game_event_entities.dart';
import 'package:wordhive_app/features/game/domain/entities/room_lobby_entities.dart';
import 'package:wordhive_app/features/game/presentation/providers/game_board_provider.dart';
import 'package:wordhive_app/features/game/presentation/widgets/forming_word_bar.dart';
import 'package:wordhive_app/features/game/presentation/widgets/podium/celebration_background.dart';
import 'package:wordhive_app/features/game/presentation/widgets/podium/podium_headline.dart';
import 'package:wordhive_app/features/game/presentation/widgets/podium/podium_stand.dart';
import 'package:wordhive_app/features/game/presentation/widgets/podium/podium_summary.dart';
import 'package:wordhive_app/features/game/presentation/widgets/room_player_slot_widget.dart';
import 'unit/fake_game_repository.dart';

PodiumEntryEntity entry(int rank, String id, {int words = 2}) => PodiumEntryEntity(
    rank: rank,
    userId: id,
    username: id,
    avatarUrl: 'animales_0$rank',
    score: 100 - rank * 10,
    wordsCount: words,
    trophiesEarned: 4 - rank);

Widget app(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {
  group('Guia de la palabra que se va formando', () {
    test('va en camino si alguna palabra pendiente empieza asi (o termina, trazada al reves)', () {
      expect(FormingWordBar.isOnTrack('PER', ['PERRO']), isTrue);
      expect(FormingWordBar.isOnTrack('ORR', ['PERRO']), isTrue);
      expect(FormingWordBar.isOnTrack('PEX', ['PERRO']), isFalse);
      expect(FormingWordBar.isOnTrack('', ['PERRO']), isFalse);
    });

    testWidgets('muestra letra a letra lo que el jugador va trazando', (tester) async {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final grid = [
        ['P', 'E', 'R', 'R', 'O'],
      ];
      await tester.pumpWidget(UncontrolledProviderScope(
        container: container,
        child: app(const FormingWordBar(pendingWords: ['PERRO'])),
      ));
      expect(find.text('Aquí verás la palabra que vas formando'), findsOneWidget);

      container.read(gameBoardProvider.notifier)
        ..startSelection(0, 0, grid)
        ..updateSelection(0, 2, grid);
      await tester.pump(const Duration(milliseconds: 300));
      for (final l in ['P', 'E', 'R']) {
        expect(find.text(l), findsOneWidget);
      }

      container.read(gameBoardProvider.notifier).updateSelection(0, 4, grid);
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.byIcon(Icons.check_circle_rounded), findsOneWidget);
    });
  });

  group('Lobby', () {
    test('el aviso de "todos listos" nombra a quien creo la sala', () {
      final room = fakeRoom(players: [fakePlayer('host', host: true), fakePlayer('ana', ready: true)]);
      expect(LobbyReadiness.of(room, 'ana').hostName, 'HOST');
    });

    testWidgets('el puesto muestra el avatar elegido y nunca la palabra "Anfitrión"', (tester) async {
      await tester.pumpWidget(app(SizedBox(
        width: 180,
        height: 170,
        child: RoomPlayerSlotWidget(player: fakePlayer('host', host: true), slotIndex: 0),
      )));
      expect(find.byType(AvatarView), findsOneWidget);
      expect(find.textContaining('Anfitri'), findsNothing);
      expect(find.text('Creó la sala'), findsOneWidget);
    });
  });

  group('Podio', () {
    test('el titular cambia segun quien mira y si es solitario', () {
      final multi = [entry(1, 'Ana'), entry(2, 'Beto'), entry(3, 'Caro')];
      expect(PodiumSummary(podium: multi, currentUserId: 'Ana', totalWords: 5).headline, '¡Ganaste!');
      final lost = PodiumSummary(podium: multi, currentUserId: 'Caro', totalWords: 5);
      expect(lost.headline, '¡Ana gana!');
      expect(lost.subtitle, 'Quedaste en el puesto 3 de 3');
      expect(PodiumSummary(podium: [entry(1, 'Ana', words: 5)], currentUserId: 'Ana', totalWords: 5).headline,
          '¡Sopa completada!');
      expect(PodiumSummary(podium: [entry(1, 'Ana', words: 3)], currentUserId: 'Ana', totalWords: 5).headline,
          '¡Se acabó el tiempo!');
    });

    testWidgets('pinta el titular, los avatares en el podio y el resumen propio', (tester) async {
      final podium = [entry(1, 'Ana'), entry(2, 'Beto'), entry(3, 'Caro')];
      final summary = PodiumSummary(podium: podium, currentUserId: 'Beto', totalWords: 5);
      await tester.pumpWidget(app(CelebrationBackground(
        child: SingleChildScrollView(
          child: Column(children: [
            const SizedBox(height: 40),
            PodiumHeadline(summary: summary),
            const SizedBox(height: 40),
            PodiumStand(podium: podium, currentUserId: 'Beto'),
            PodiumMyResultCard(me: summary.me!),
          ]),
        ),
      )));
      await tester.pump(const Duration(seconds: 2));
      expect(find.text('¡ANA GANA!'), findsOneWidget);
      for (final id in ['Ana', 'Beto', 'Caro']) {
        expect(find.byKey(ValueKey('podium-avatar-$id')), findsOneWidget);
      }
      expect(find.text('Beto (tú)'), findsOneWidget);
      expect(find.text('Puesto'), findsOneWidget);
    });
  });
}
