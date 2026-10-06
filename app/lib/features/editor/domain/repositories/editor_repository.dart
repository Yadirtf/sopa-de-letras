import 'package:dartz/dartz.dart';
import '../entities/preview_word_search_entity.dart';
import '../entities/my_word_search_entity.dart';

abstract class EditorRepository {
  Future<Either<String, PreviewWordSearchEntity>> preview({
    required List<String> words,
    required int gridSize,
    required String difficulty,
  });

  Future<Either<String, MyWordSearchEntity>> create({
    required String title,
    String? description,
    required String category,
    required String difficulty,
    required int gridSize,
    required List<String> words,
    bool isPublic = true,
  });

  Future<Either<String, List<MyWordSearchEntity>>> getMyWordSearches();

  Future<Either<String, void>> delete(String id);
}
