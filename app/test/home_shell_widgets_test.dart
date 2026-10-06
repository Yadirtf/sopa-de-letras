import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/catalog/domain/entities/word_search_summary_entity.dart';
import 'package:wordhive_app/features/catalog/presentation/widgets/catalog_grid_delegate.dart';
import 'package:wordhive_app/features/catalog/presentation/widgets/word_search_tile_card.dart';
import 'package:wordhive_app/features/home/presentation/widgets/home_bottom_bar.dart';

void main() {
  testWidgets('la barra inferior lleva a cada pestaña y la casita va al inicio', (tester) async {
    final visited = <int>[];

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        bottomNavigationBar: HomeBottomBar(
          currentBranch: HomeBottomBar.homeBranch,
          onBranchSelected: visited.add,
        ),
      ),
    ));

    await tester.tap(find.text('Unirme'));
    await tester.tap(find.text('Mis sopas'));
    await tester.tap(find.text('Inicio'));
    await tester.tap(find.text('Crear'));
    await tester.tap(find.text('Perfil'));

    expect(visited, [
      HomeBottomBar.joinBranch,
      HomeBottomBar.mineBranch,
      HomeBottomBar.homeBranch,
      HomeBottomBar.createBranch,
      HomeBottomBar.profileBranch,
    ]);
    expect(tester.takeException(), isNull);
  });

  testWidgets('la tarjeta cabe en una columna de teléfono sin desbordarse', (tester) async {
    var tapped = false;
    final item = WordSearchSummaryEntity(
      id: 'ws-1',
      title: 'Animales de la selva amazónica y sus amigos',
      category: 'NATURALEZA',
      difficulty: 'HARD',
      language: 'es',
      gridSize: 15,
      wordCount: 12,
      playCount: 340,
      creatorId: 'u1',
      creatorName: 'Profesora Margarita',
      createdAt: DateTime(2024, 1, 1),
    );

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Center(
          child: SizedBox(
            width: 160,
            height: catalogGridDelegate.mainAxisExtent,
            child: WordSearchTileCard(item: item, onTap: () => tapped = true),
          ),
        ),
      ),
    ));

    expect(find.text('Naturaleza'), findsOneWidget);
    expect(find.text('por Profesora Margarita'), findsOneWidget);
    await tester.tap(find.byType(WordSearchTileCard));
    expect(tapped, isTrue);
    expect(tester.takeException(), isNull);
  });
}
