import 'package:dartz/dartz.dart';
import '../entities/my_word_search_entity.dart';
import '../repositories/editor_repository.dart';

class CreateWordSearchUseCase {
  final EditorRepository _repository;

  CreateWordSearchUseCase(this._repository);

  Future<Either<String, MyWordSearchEntity>> call({
    required String title,
    String? description,
    required String category,
    required String difficulty,
    required int gridSize,
    required List<String> words,
    bool isPublic = true,
  }) {
    return _repository.create(
      title: title,
      description: description,
      category: category,
      difficulty: difficulty,
      gridSize: gridSize,
      words: words,
      isPublic: isPublic,
    );
  }
}
