import 'package:dartz/dartz.dart';
import '../entities/preview_word_search_entity.dart';
import '../repositories/editor_repository.dart';

class PreviewWordSearchUseCase {
  final EditorRepository _repository;

  PreviewWordSearchUseCase(this._repository);

  Future<Either<String, PreviewWordSearchEntity>> call({
    required List<String> words,
    required int gridSize,
    required String difficulty,
  }) {
    return _repository.preview(
      words: words,
      gridSize: gridSize,
      difficulty: difficulty,
    );
  }
}
