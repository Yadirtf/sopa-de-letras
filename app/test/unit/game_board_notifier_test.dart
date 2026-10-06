import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/game/presentation/providers/game_board_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GameBoardNotifier Test', () {
    final grid = [
      ['P', 'E', 'R', 'R', 'O'],
      ['G', 'A', 'T', 'O', 'X'],
      ['A', 'V', 'E', 'S', 'Y'],
      ['X', 'Y', 'Z', 'W', 'K'],
    ];

    test('debe iniciar selección en celda válida', () {
      final notifier = GameBoardNotifier();
      notifier.startSelection(0, 0, grid);

      expect(notifier.state.startCell, const CellCoord(0, 0));
      expect(notifier.state.selectedCells.length, 1);
      expect(notifier.state.formedWord, 'P');
    });

    test('debe extender selección horizontalmente formando palabra', () {
      final notifier = GameBoardNotifier();
      notifier.startSelection(0, 0, grid);
      notifier.updateSelection(0, 4, grid);

      expect(notifier.state.selectedCells.length, 5);
      expect(notifier.state.formedWord, 'PERRO');
      expect(notifier.state.selectedCells.last, const CellCoord(0, 4));
    });

    test('debe extender selección diagonalmente', () {
      final notifier = GameBoardNotifier();
      notifier.startSelection(0, 0, grid);
      notifier.updateSelection(2, 2, grid);

      expect(notifier.state.selectedCells.length, 3);
      expect(notifier.state.formedWord, 'PAE');
    });

    test('debe limpiar selección y retornar estado previo', () {
      final notifier = GameBoardNotifier();
      notifier.startSelection(0, 0, grid);
      notifier.updateSelection(0, 4, grid);

      final finished = notifier.clearSelection();

      expect(finished.formedWord, 'PERRO');
      expect(notifier.state.selectedCells.isEmpty, true);
      expect(notifier.state.startCell, isNull);
    });
  });
}
