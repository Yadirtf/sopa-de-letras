import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/category_model.dart';

class CategoryRemoteDataSource {
  final ApiClient _apiClient;

  CategoryRemoteDataSource(this._apiClient);

  Future<List<CategoryModel>> search(String term) async {
    final response = await _apiClient.dio.get(
      ApiEndpoints.categories,
      queryParameters: term.trim().isEmpty ? null : {'search': term.trim()},
    );
    final rawList = response.data as List<dynamic>? ?? [];
    return rawList.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CategoryModel> create(String name) async {
    final response = await _apiClient.dio.post(ApiEndpoints.categories, data: {'name': name.trim()});
    final body = response.data as Map<String, dynamic>;
    return CategoryModel.fromJson(body['category'] as Map<String, dynamic>);
  }
}
