import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';

class NotificationRemoteDataSource {
  final ApiClient _client;

  NotificationRemoteDataSource(this._client);

  Future<Map<String, dynamic>> list({String? cursor}) async {
    final response = await _client.dio.get(
      ApiEndpoints.notifications,
      queryParameters: {'limit': 20, if (cursor != null) 'cursor': cursor},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markRead(String id) async =>
      (await _client.dio.patch(ApiEndpoints.notificationRead(id), data: const <String, dynamic>{})).data as Map<String, dynamic>;

  Future<void> markAllRead() => _client.dio.patch(ApiEndpoints.notificationsReadAll, data: const <String, dynamic>{});
}
