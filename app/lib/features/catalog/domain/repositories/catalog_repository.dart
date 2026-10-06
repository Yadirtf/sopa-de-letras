import 'package:dartz/dartz.dart';
import '../entities/word_search_summary_entity.dart';
import '../entities/word_search_detail_entity.dart';

class CatalogResult {
  final List<WordSearchSummaryEntity> items;
  final String? nextCursor;
  final int totalCount;
  final bool hasMore;

  const CatalogResult({
    required this.items,
    this.nextCursor,
    required this.totalCount,
    required this.hasMore,
  });
}

abstract class CatalogRepository {
  Future<Either<String, CatalogResult>> getCatalog({
    String? cursor,
    int limit = 12,
    String? category,
    String? difficulty,
    String? search,
  });

  Future<Either<String, WordSearchDetailEntity>> getWordSearchDetail(String id);
}
