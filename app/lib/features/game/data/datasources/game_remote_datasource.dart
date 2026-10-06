import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/game_room_model.dart';

abstract class GameRemoteDataSource {
  Future<GameRoomModel> createRoom({
    required String wordSearchId,
    int? maxPlayers,
    int? timeLimitSeconds,
    bool? isPrivate,
  });

  Future<GameRoomModel> getRoomByCode(String code);
}

class GameRemoteDataSourceImpl implements GameRemoteDataSource {
  final ApiClient _apiClient;

  GameRemoteDataSourceImpl({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  @override
  Future<GameRoomModel> createRoom({
    required String wordSearchId,
    int? maxPlayers,
    int? timeLimitSeconds,
    bool? isPrivate,
  }) async {
    final response = await _apiClient.dio.post(
      ApiEndpoints.rooms,
      data: {
        'wordSearchId': wordSearchId,
        if (maxPlayers != null) 'maxPlayers': maxPlayers,
        if (timeLimitSeconds != null) 'timeLimitSeconds': timeLimitSeconds,
        if (isPrivate != null) 'isPrivate': isPrivate,
      },
    );

    final rawData = response.data['data'] as Map<String, dynamic>;
    return GameRoomModel.fromJson(rawData);
  }

  @override
  Future<GameRoomModel> getRoomByCode(String code) async {
    final response = await _apiClient.dio.get(
      '${ApiEndpoints.rooms}/${code.toUpperCase()}',
    );

    final rawData = response.data['data'] as Map<String, dynamic>;
    return GameRoomModel.fromJson(rawData);
  }
}
