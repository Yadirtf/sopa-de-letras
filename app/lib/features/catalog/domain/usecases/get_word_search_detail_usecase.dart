import 'package:dartz/dartz.dart';
import '../entities/word_search_detail_entity.dart';
import '../repositories/catalog_repository.dart';

class GetWordSearchDetailUseCase {
  final CatalogRepository _repository;

  GetWordSearchDetailUseCase(this._repository);

  Future<Either<String, WordSearchDetailEntity>> call(String id) {
    return _repository.getWordSearchDetail(id);
  }
}
