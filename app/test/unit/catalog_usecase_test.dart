import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:wordhive_app/features/catalog/domain/entities/word_search_summary_entity.dart';
import 'package:wordhive_app/features/catalog/domain/entities/word_search_detail_entity.dart';
import 'package:wordhive_app/features/catalog/domain/repositories/catalog_repository.dart';
import 'package:wordhive_app/features/catalog/domain/usecases/get_catalog_usecase.dart';
import 'package:wordhive_app/features/catalog/domain/usecases/get_word_search_detail_usecase.dart';

class MockCatalogRepository extends Mock implements CatalogRepository {}

void main() {
  late MockCatalogRepository mockRepository;
  late GetCatalogUseCase getCatalogUseCase;
  late GetWordSearchDetailUseCase getDetailUseCase;

  setUp(() {
    mockRepository = MockCatalogRepository();
    getCatalogUseCase = GetCatalogUseCase(mockRepository);
    getDetailUseCase = GetWordSearchDetailUseCase(mockRepository);
  });

  group('GetCatalogUseCase', () {
    final tResult = CatalogResult(
      items: [
        WordSearchSummaryEntity(
          id: 'ws_1',
          title: 'Insectos',
          category: 'NATURALEZA',
          difficulty: 'EASY',
          language: 'es',
          gridSize: 10,
          wordCount: 5,
          playCount: 10,
          creatorId: 'user_1',
          creatorName: 'Bee1',
          createdAt: DateTime.now(),
        ),
      ],
      nextCursor: 'cursor_2',
      totalCount: 1,
      hasMore: true,
    );

    test('debe retornar CatalogResult exitoso del repositorio', () async {
      when(() => mockRepository.getCatalog(
            cursor: any(named: 'cursor'),
            limit: any(named: 'limit'),
            category: any(named: 'category'),
            difficulty: any(named: 'difficulty'),
            search: any(named: 'search'),
          )).thenAnswer((_) async => Right(tResult));

      final result = await getCatalogUseCase(limit: 10);

      expect(result.isRight(), true);
      result.fold(
        (l) => fail('No debería fallar'),
        (r) {
          expect(r.items.length, 1);
          expect(r.items.first.title, 'Insectos');
          expect(r.hasMore, true);
        },
      );
    });
  });

  group('GetWordSearchDetailUseCase', () {
    final tDetail = WordSearchDetailEntity(
      id: 'ws_detail_1',
      title: 'Galaxias',
      category: 'CIENCIA',
      difficulty: 'HARD',
      language: 'es',
      gridSize: 12,
      wordCount: 3,
      words: const ['ANDROMEDA', 'VIA_LACTEA', 'SOMBRERO'],
      playCount: 99,
      creatorId: 'user_astro',
      creatorName: 'AstroBee',
      previewGrid: const [
        ['A', 'B'],
        ['C', 'D'],
      ],
      createdAt: DateTime.now(),
    );

    test('debe retornar WordSearchDetailEntity exitoso del repositorio', () async {
      when(() => mockRepository.getWordSearchDetail('ws_detail_1'))
          .thenAnswer((_) async => Right(tDetail));

      final result = await getDetailUseCase('ws_detail_1');

      expect(result.isRight(), true);
      result.fold(
        (l) => fail('No debería fallar'),
        (r) {
          expect(r.title, 'Galaxias');
          expect(r.words.length, 3);
          expect(r.creatorName, 'AstroBee');
        },
      );
    });
  });
}
