import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/word_search_summary_model.dart';
import '../models/word_search_detail_model.dart';

class RemoteCatalogResponse {
  final List<WordSearchSummaryModel> items;
  final String? nextCursor;
  final int totalCount;
  final bool hasMore;

  const RemoteCatalogResponse({
    required this.items,
    this.nextCursor,
    required this.totalCount,
    required this.hasMore,
  });
}

class CatalogRemoteDataSource {
  final ApiClient _apiClient;

  CatalogRemoteDataSource(this._apiClient);

  Future<RemoteCatalogResponse> getCatalog({
    String? cursor,
    int limit = 12,
    String? category,
    String? difficulty,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{
      'limit': limit,
    };
    if (cursor != null && cursor.isNotEmpty) queryParams['cursor'] = cursor;
    if (category != null && category.isNotEmpty && category != 'TODAS') {
      queryParams['category'] = category;
    }
    if (difficulty != null && difficulty.isNotEmpty && difficulty != 'TODAS') {
      queryParams['difficulty'] = difficulty;
    }
    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }

    final response = await _apiClient.dio.get(
      ApiEndpoints.wordSearches,
      queryParameters: queryParams,
    );

    final data = response.data as Map<String, dynamic>;
    final itemsRaw = data['items'] as List<dynamic>? ?? [];
    final items = itemsRaw
        .map((e) => WordSearchSummaryModel.fromJson(e as Map<String, dynamic>))
        .toList();

    return RemoteCatalogResponse(
      items: items,
      nextCursor: data['nextCursor'] as String?,
      totalCount: data['totalCount'] as int? ?? items.length,
      hasMore: data['hasMore'] as bool? ?? false,
    );
  }

  Future<WordSearchDetailModel> getWordSearchDetail(String id) async {
    final response = await _apiClient.dio.get(
      '${ApiEndpoints.wordSearches}/$id',
    );
    final data = response.data as Map<String, dynamic>;
    return WordSearchDetailModel.fromJson(data);
  }
}
