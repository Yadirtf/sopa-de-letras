import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/auth/presentation/widgets/avatar_picker.dart';
import 'package:wordhive_app/features/auth/presentation/widgets/register_step_header.dart';

void main() {
  testWidgets('el selector cambia de categoría y devuelve el avatar tocado', (tester) async {
    String? picked;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: AvatarPicker(selectedId: 'animales_01', onSelected: (id) => picked = id)),
    ));

    expect(find.bySemanticsLabel('Gato'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('Categoría Fantasía'));
    await tester.pumpAndSettle();
    expect(find.bySemanticsLabel('Gato'), findsNothing);

    await tester.tap(find.bySemanticsLabel('Hada'));
    expect(picked, 'fantasia_06');
  });

  testWidgets('cada paso del registro tiene su propio título', (tester) async {
    for (var step = 0; step < registerSteps.length; step++) {
      await tester.pumpWidget(MaterialApp(home: Scaffold(body: RegisterStepHeader(step: step))));
      await tester.pumpAndSettle();
      expect(find.text('Paso ${step + 1} de 3'), findsOneWidget);
      expect(find.text(registerSteps[step].title), findsOneWidget);
      for (final other in registerSteps.where((s) => s != registerSteps[step])) {
        expect(find.text(other.title), findsNothing);
      }
    }
  });
}
