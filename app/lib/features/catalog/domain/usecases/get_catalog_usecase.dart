import 'package:dartz/dartz.dart';
import '../repositories/catalog_repository.dart';

class GetCatalogUseCase {
  final CatalogRepository _repository;

  GetCatalogUseCase(this._repository);

  Future<Either<String, CatalogResult>> call({
    String? cursor,
    int limit = 12,
    String? category,
    String? difficulty,
    String? search,
  }) {
    return _repository.getCatalog(
      cursor: cursor,
      limit: limit,
      category: category,
      difficulty: difficulty,
      search: search,
    );
  }
}
