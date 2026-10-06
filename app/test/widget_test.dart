import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:wordhive_app/app.dart';

void main() {
  setUp(() async {
    final tempDir = await Directory.systemTemp.createTemp('hive_test');
    Hive.init(tempDir.path);
  });

  tearDown(() async {
    await Hive.close();
  });

  testWidgets('WordHiveApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: WordHiveApp(),
      ),
    );
    expect(find.byType(WordHiveApp), findsOneWidget);
  });
}
