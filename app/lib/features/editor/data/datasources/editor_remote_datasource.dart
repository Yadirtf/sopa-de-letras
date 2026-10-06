import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/preview_word_search_model.dart';
import '../models/my_word_search_model.dart';

class EditorRemoteDataSource {
  final ApiClient _apiClient;

  EditorRemoteDataSource(this._apiClient);

  Future<PreviewWordSearchModel> preview({
    required List<String> words,
    required int gridSize,
    required String difficulty,
  }) async {
    final response = await _apiClient.dio.post(
      '${ApiEndpoints.wordSearches}/preview',
      data: {
        'words': words,
        'gridSize': gridSize,
        'difficulty': difficulty,
      },
    );
    return PreviewWordSearchModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<MyWordSearchModel> create({
    required String title,
    String? description,
    required String category,
    required String difficulty,
    required int gridSize,
    required List<String> words,
    bool isPublic = true,
  }) async {
    final response = await _apiClient.dio.post(
      ApiEndpoints.wordSearches,
      data: {
        'title': title,
        'description': description,
        'category': category,
        'difficulty': difficulty,
        'gridSize': gridSize,
        'words': words,
        'isPublic': isPublic,
      },
    );
    return MyWordSearchModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<MyWordSearchModel>> getMyWordSearches() async {
    final response = await _apiClient.dio.get('${ApiEndpoints.wordSearches}/my');
    final rawList = response.data as List<dynamic>? ?? [];
    return rawList
        .map((e) => MyWordSearchModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> delete(String id) async {
    await _apiClient.dio.delete('${ApiEndpoints.wordSearches}/$id');
  }
}
