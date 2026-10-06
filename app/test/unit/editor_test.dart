import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:wordhive_app/features/editor/data/models/placed_word_model.dart';
import 'package:wordhive_app/features/editor/data/models/preview_word_search_model.dart';
import 'package:wordhive_app/features/editor/data/models/my_word_search_model.dart';
import 'package:wordhive_app/features/editor/domain/entities/placed_word_entity.dart';
import 'package:wordhive_app/features/editor/domain/entities/preview_word_search_entity.dart';
import 'package:wordhive_app/features/editor/domain/entities/my_word_search_entity.dart';
import 'package:wordhive_app/features/editor/domain/repositories/editor_repository.dart';
import 'package:wordhive_app/features/editor/domain/usecases/preview_word_search_usecase.dart';
import 'package:wordhive_app/features/editor/domain/usecases/create_word_search_usecase.dart';

class MockEditorRepository extends Mock implements EditorRepository {}

void main() {
  group('Editor Models', () {
    test('PlacedWordModel debe deserializarse y ser subtipo de PlacedWordEntity', () {
      final json = {
        'word': 'ABEJA',
        'startRow': 0,
        'startCol': 0,
        'endRow': 0,
        'endCol': 4,
        'direction': 'RIGHT',
      };
      final model = PlacedWordModel.fromJson(json);
      expect(model, isA<PlacedWordEntity>());
      expect(model.word, 'ABEJA');
      expect(model.direction, 'RIGHT');
    });

    test('PreviewWordSearchModel debe deserializarse correctamente', () {
      final json = {
        'grid': [
          ['A', 'B'],
          ['C', 'D'],
        ],
        'placedWords': [
          {
            'word': 'AB',
            'startRow': 0,
            'startCol': 0,
            'endRow': 0,
            'endCol': 1,
            'direction': 'RIGHT',
          }
        ],
        'gridSize': 2,
      };
      final model = PreviewWordSearchModel.fromJson(json);
      expect(model, isA<PreviewWordSearchEntity>());
      expect(model.grid.length, 2);
      expect(model.placedWords.length, 1);
    });

    test('MyWordSearchModel debe deserializarse correctamente', () {
      final json = {
        'id': 'my-1',
        'title': 'Sopa Espacial',
        'category': 'CIENCIA',
        'difficulty': 'HARD',
        'gridSize': 14,
        'wordCount': 8,
        'playCount': 10,
        'isPublic': true,
        'createdAt': '2026-03-05T12:00:00.000Z',
      };
      final model = MyWordSearchModel.fromJson(json);
      expect(model, isA<MyWordSearchEntity>());
      expect(model.title, 'Sopa Espacial');
      expect(model.difficulty, 'HARD');
    });
  });

  group('Editor UseCases', () {
    late MockEditorRepository mockRepo;
    late PreviewWordSearchUseCase previewUseCase;
    late CreateWordSearchUseCase createUseCase;

    setUp(() {
      mockRepo = MockEditorRepository();
      previewUseCase = PreviewWordSearchUseCase(mockRepo);
      createUseCase = CreateWordSearchUseCase(mockRepo);
    });

    test('PreviewWordSearchUseCase debe invocar repository.preview', () async {
      final tPreview = PreviewWordSearchEntity(
        grid: const [['A']],
        placedWords: const [],
        gridSize: 1,
      );

      when(() => mockRepo.preview(
            words: any(named: 'words'),
            gridSize: any(named: 'gridSize'),
            difficulty: any(named: 'difficulty'),
          )).thenAnswer((_) async => Right(tPreview));

      final result = await previewUseCase(
        words: ['ABEJA'],
        gridSize: 10,
        difficulty: 'EASY',
      );

      expect(result.isRight(), true);
    });

    test('CreateWordSearchUseCase debe invocar repository.create', () async {
      final tCreated = MyWordSearchEntity(
        id: 'new-id',
        title: 'Nueva Sopa',
        category: 'ARTE',
        difficulty: 'MEDIUM',
        gridSize: 12,
        wordCount: 5,
        playCount: 0,
        isPublic: true,
        createdAt: DateTime.now(),
      );

      when(() => mockRepo.create(
            title: any(named: 'title'),
            category: any(named: 'category'),
            difficulty: any(named: 'difficulty'),
            gridSize: any(named: 'gridSize'),
            words: any(named: 'words'),
            isPublic: any(named: 'isPublic'),
          )).thenAnswer((_) async => Right(tCreated));

      final result = await createUseCase(
        title: 'Nueva Sopa',
        category: 'ARTE',
        difficulty: 'MEDIUM',
        gridSize: 12,
        words: ['PINTURA', 'LIENZO', 'COLOR', 'MUSEO', 'PINCEL'],
      );

      expect(result.isRight(), true);
    });
  });
}
