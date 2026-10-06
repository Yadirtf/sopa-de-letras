import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/game/presentation/widgets/word_search_canvas_widget.dart';
import 'package:wordhive_app/features/game/presentation/widgets/word_search_painter.dart';

/// Reproduce el arrastre real con el dedo, dentro de un scroll como estaba antes:
/// la palabra debe llegar completa, no cortada en dos letras.
void main() {
  final grid = [
    ['P', 'E', 'R', 'R', 'O'],
    ['G', 'A', 'T', 'O', 'X'],
    ['A', 'V', 'E', 'S', 'Y'],
    ['X', 'Y', 'Z', 'W', 'K'],
    ['L', 'U', 'Z', 'A', 'B'],
  ];

  Future<List<String>> traceOnBoard(WidgetTester tester, Offset from, Offset to) async {
    final traced = <String>[];
    await tester.pumpWidget(ProviderScope(
      child: MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(
              width: 302,
              height: 302,
              child: WordSearchCanvasWidget(
                grid: grid,
                found: const [],
                onWordTraced: (word, start, end) {
                  traced.add(word);
                  return true;
                },
              ),
            ),
          ),
        ),
      ),
    ));
    final board = tester.getTopLeft(find.byWidgetPredicate((w) => w is CustomPaint && w.painter is WordSearchPainter));
    final gesture = await tester.startGesture(board + from);
    for (var i = 1; i <= 10; i++) {
      await gesture.moveTo(board + Offset.lerp(from, to, i / 10)!);
      await tester.pump();
    }
    await gesture.up();
    await tester.pump(const Duration(milliseconds: 500));
    return traced;
  }

  testWidgets('arrastre horizontal marca la palabra completa', (tester) async {
    expect(await traceOnBoard(tester, const Offset(30, 30), const Offset(270, 30)), ['PERRO']);
  });

  testWidgets('arrastre vertical no lo roba el scroll', (tester) async {
    expect(await traceOnBoard(tester, const Offset(30, 30), const Offset(30, 270)), ['PGAXL']);
  });

  testWidgets('arrastre diagonal marca toda la diagonal', (tester) async {
    expect(await traceOnBoard(tester, const Offset(30, 30), const Offset(270, 270)), ['PAEWB']);
  });
}
