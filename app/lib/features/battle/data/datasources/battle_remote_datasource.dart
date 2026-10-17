import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/battle_catalog.dart';
import '../../domain/entities/battle_config.dart';
import '../models/battle_catalog_model.dart';

/// HTTP de la batalla: catálogo, recomendación de ejército y crear sala.
class BattleRemoteDataSource {
  final ApiClient _api;

  BattleRemoteDataSource({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  Future<BattleCatalog> catalog() async {
    final response = await _api.dio.get(ApiEndpoints.battleCatalog);
    return BattleCatalogModel.fromJson((response.data['data'] as Map).cast<String, dynamic>());
  }

  Future<Map<String, int>> recommendation({required String terrainId, required int cols, required int rows}) async {
    final response = await _api.dio.get(
      ApiEndpoints.battleRecommendation,
      queryParameters: {'terrain': terrainId, 'cols': cols, 'rows': rows},
    );
    final army = (response.data['data']['army'] as Map).cast<String, dynamic>();
    return army.map((k, v) => MapEntry(k, (v as num).toInt()));
  }

  /// Devuelve el código de la sala nueva.
  Future<String> createRoom(BattleConfig config) async {
    final response = await _api.dio.post(ApiEndpoints.battleRooms, data: config.toJson());
    return response.data['data']['code'].toString();
  }
}
