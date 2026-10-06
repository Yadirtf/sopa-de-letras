import '../../domain/entities/preview_word_search_entity.dart';
import 'placed_word_model.dart';

class PreviewWordSearchModel extends PreviewWordSearchEntity {
  const PreviewWordSearchModel({
    required super.grid,
    required super.placedWords,
    required super.gridSize,
  });

  factory PreviewWordSearchModel.fromJson(Map<String, dynamic> json) {
    final rawGrid = json['grid'] as List<dynamic>? ?? [];
    final grid = rawGrid
        .map((row) => (row as List<dynamic>).map((c) => c.toString()).toList())
        .toList();

    final rawPlaced = json['placedWords'] as List<dynamic>? ?? [];
    final placedWords = rawPlaced
        .map((e) => PlacedWordModel.fromJson(e as Map<String, dynamic>))
        .toList();

    return PreviewWordSearchModel(
      grid: grid,
      placedWords: placedWords,
      gridSize: json['gridSize'] as int? ?? grid.length,
    );
  }
}
