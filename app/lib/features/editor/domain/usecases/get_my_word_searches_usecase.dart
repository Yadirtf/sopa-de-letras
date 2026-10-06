import 'package:dartz/dartz.dart';
import '../entities/my_word_search_entity.dart';
import '../repositories/editor_repository.dart';

class GetMyWordSearchesUseCase {
  final EditorRepository _repository;

  GetMyWordSearchesUseCase(this._repository);

  Future<Either<String, List<MyWordSearchEntity>>> call() {
    return _repository.getMyWordSearches();
  }
}
