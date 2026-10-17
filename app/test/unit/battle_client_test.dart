import 'dart:ui';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/battle/data/models/battle_view_model.dart';
import 'package:wordhive_app/features/battle/domain/entities/battle_catalog.dart';
import 'package:wordhive_app/features/battle/domain/entities/battle_coordinate.dart';
import 'package:wordhive_app/features/battle/domain/entities/battle_view.dart';
import 'package:wordhive_app/features/battle/domain/repositories/battle_repository.dart';
import 'package:wordhive_app/features/battle/presentation/providers/placement_notifier.dart';

const desert = BattleTerrain(
  id: 'DESERT',
  name: 'Desierto',
  emoji: '🏜️',
  inspiredBy: 'El Alamein',
  ground: Color(0xFFE0C68A),
  gridLine: Color(0xFF8A6D3B),
  units: [
    BattleUnitType(id: 'soldier', name: 'Soldado', emoji: '🪖', width: 1, height: 2),
    BattleUnitType(id: 'tank', name: 'Tanque', emoji: '🛡️', width: 2, height: 3),
  ],
);

void main() {
  group('BattleCoordinate', () {
    test('entiende la coordenada escrita como en papel', () {
      expect(BattleCoordinate.parse('H11'), (7, 10));
      expect(BattleCoordinate.parse('11-H'), (7, 10));
      expect(BattleCoordinate.parse(' h 11 '), (7, 10));
      expect(BattleCoordinate.parse('a1'), (0, 0));
    });

    test('rechaza lo que no es una coordenada', () {
      expect(BattleCoordinate.parse(''), isNull);
      expect(BattleCoordinate.parse('HH'), isNull);
      expect(BattleCoordinate.parse('H0'), isNull);
      expect(BattleCoordinate.parse('123'), isNull);
    });

    test('formatea letra y número', () => expect(BattleCoordinate.format(7, 10), 'H11'));
  });

  group('PlacementNotifier', () {
    late PlacementNotifier notifier;
    setUp(() => notifier = PlacementNotifier());

    test('marca las figuras que se tocan, también en diagonal', () {
      notifier.seed(const [
        UnitPlacement(typeId: 'soldier', col: 0, row: 0),
        UnitPlacement(typeId: 'tank', col: 1, row: 2),
      ], desert, 10, 10);
      expect(notifier.state.conflicts, {0, 1});
      expect(notifier.state.isValid, isFalse);
    });

    test('mover y girar queda dentro de la arena y limpia el choque', () {
      notifier.seed(const [
        UnitPlacement(typeId: 'soldier', col: 0, row: 0),
        UnitPlacement(typeId: 'tank', col: 1, row: 2),
      ], desert, 10, 10);
      notifier.select(1);
      notifier.moveSelectedTo(9, 9);
      expect(notifier.state.units[1].col, 8);
      expect(notifier.state.units[1].row, 7);
      expect(notifier.state.isValid, isTrue);

      notifier.rotateSelected();
      expect(notifier.sizeOf(notifier.state.units[1]), (3, 2));
      expect(notifier.state.units[1].col, 7);
      expect(notifier.unitAt(9, 8), 1);
    });
  });

  test('BattleViewModel lee la vista privada del socket', () {
    final view = BattleViewModel.fromJson({
      'code': 'B4TT1E',
      'status': 'PLAYING',
      'config': {'cols': 12, 'rows': 10, 'terrain': 'DESERT', 'inputMode': 'TYPE_ONLY', 'opponent': 'BOT'},
      'hostUserId': 'u1',
      'myUserId': 'u1',
      'turnUserId': 'u1',
      'players': [
        {'userId': 'u1', 'username': 'ana', 'shotsFired': 4, 'hitsLanded': 1},
        {'userId': 'bot:abejita', 'username': 'Abejita', 'isBot': true},
      ],
      'myAmmo': {'BULLET': -1, 'MISSILE': 2},
      'myBoard': {'units': [], 'marks': []},
      'enemyBoard': {
        'marks': [],
        'revealed': [],
        'scans': [
          {'col': 3, 'row': 4, 'count': 2},
        ]
      },
      'lastShot': {
        'seq': 3,
        'shooterId': 'u1',
        'weapon': 'MISSILE',
        'col': 3,
        'row': 4,
        'cells': [
          {'col': 3, 'row': 4, 'result': 'HIT'},
        ],
        'destroyed': [],
        'keepsTurn': true,
      },
    });
    expect(view.status, BattleStatus.playing);
    expect(view.isMyTurn, isTrue);
    expect(view.me?.accuracy, 25);
    expect(view.enemy?.isBot, isTrue);
    expect(view.myAmmo['MISSILE'], 2);
    expect(view.scans.single.count, 2);
    expect(view.lastShot?.anyHit, isTrue);
  });
}
