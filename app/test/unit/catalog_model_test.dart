import 'package:flutter_test/flutter_test.dart';
import 'package:wordhive_app/features/catalog/data/models/word_search_summary_model.dart';
import 'package:wordhive_app/features/catalog/data/models/word_search_detail_model.dart';
import 'package:wordhive_app/features/catalog/domain/entities/word_search_summary_entity.dart';
import 'package:wordhive_app/features/catalog/domain/entities/word_search_detail_entity.dart';

void main() {
  group('WordSearchSummaryModel', () {
    final tJson = {
      'id': 'ws_100',
      'title': 'Astronomía',
      'description': 'Constelaciones del hemisferio norte',
      'category': 'CIENCIA',
      'difficulty': 'MEDIUM',
      'language': 'es',
      'gridSize': 12,
      'wordCount': 6,
      'playCount': 50,
      'creatorId': 'user_01',
      'creatorName': 'StellarBee',
      'createdAt': '2026-03-01T12:00:00.000Z',
    };

    test('debe ser un subtipo de WordSearchSummaryEntity', () {
      final model = WordSearchSummaryModel.fromJson(tJson);
      expect(model, isA<WordSearchSummaryEntity>());
    });

    test('debe deserializar y serializar correctamente', () {
      final model = WordSearchSummaryModel.fromJson(tJson);
      expect(model.id, 'ws_100');
      expect(model.title, 'Astronomía');
      expect(model.category, 'CIENCIA');
      expect(model.difficulty, 'MEDIUM');
      expect(model.gridSize, 12);
      expect(model.wordCount, 6);

      final jsonResult = model.toJson();
      expect(jsonResult['id'], 'ws_100');
      expect(jsonResult['title'], 'Astronomía');
    });
  });

  group('WordSearchDetailModel', () {
    final tDetailJson = {
      'id': 'ws_200',
      'title': 'Fauna Tropical',
      'description': 'Animales exóticos de la selva',
      'category': 'NATURALEZA',
      'difficulty': 'HARD',
      'language': 'es',
      'gridSize': 15,
      'wordCount': 4,
      'words': ['TUCAN', 'JAGUAR', 'MONO', 'PUMA'],
      'playCount': 120,
      'creatorId': 'user_02',
      'creatorName': 'JungleBee',
      'previewGrid': [
        ['T', 'U', 'C', 'A', 'N'],
        ['A', 'B', 'C', 'D', 'E'],
      ],
      'createdAt': '2026-03-02T10:00:00.000Z',
    };

    test('debe ser un subtipo de WordSearchDetailEntity', () {
      final model = WordSearchDetailModel.fromJson(tDetailJson);
      expect(model, isA<WordSearchDetailEntity>());
    });

    test('debe deserializar lista de palabras y matriz previewGrid correctamente', () {
      final model = WordSearchDetailModel.fromJson(tDetailJson);
      expect(model.words, ['TUCAN', 'JAGUAR', 'MONO', 'PUMA']);
      expect(model.previewGrid.length, 2);
      expect(model.previewGrid[0][0], 'T');
      expect(model.creatorName, 'JungleBee');
    });
  });
}
