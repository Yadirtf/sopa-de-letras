import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';

class SocialRemoteDataSource {
  final ApiClient _client;

  SocialRemoteDataSource(this._client);

  Future<Map<String, dynamic>> getFriends() async =>
      (await _client.dio.get(ApiEndpoints.friends)).data as Map<String, dynamic>;

  Future<List<dynamic>> search(String term) async =>
      (await _client.dio.get(ApiEndpoints.friendsSearch, queryParameters: {'q': term})).data as List<dynamic>;

  Future<Map<String, dynamic>> getRequests() async =>
      (await _client.dio.get(ApiEndpoints.friendRequests)).data as Map<String, dynamic>;

  Future<Map<String, dynamic>> sendRequest(String userId) async =>
      (await _client.dio.post(ApiEndpoints.friendRequests, data: {'userId': userId})).data as Map<String, dynamic>;

  Future<void> respond(String requestId, String action) =>
      _client.dio.patch(ApiEndpoints.friendRequest(requestId), data: {'action': action});

  Future<void> removeFriend(String userId) => _client.dio.delete(ApiEndpoints.friend(userId));

  Future<Map<String, dynamic>> invite(String friendId, String roomCode) async =>
      (await _client.dio.post(ApiEndpoints.inviteFriend(friendId), data: {'roomCode': roomCode})).data
          as Map<String, dynamic>;
}
