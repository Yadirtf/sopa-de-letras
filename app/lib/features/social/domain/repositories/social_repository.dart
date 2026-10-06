import '../entities/social_entities.dart';

abstract class SocialRepository {
  Future<List<FriendEntity>> getFriends();
  Future<List<PlayerSearchResultEntity>> searchPlayers(String term);
  Future<({List<FriendRequestEntity> incoming, List<FriendRequestEntity> outgoing})> getRequests();
  Future<FriendRequestOutcome> sendRequest(String userId);
  Future<void> acceptRequest(String requestId);
  Future<void> rejectRequest(String requestId);
  Future<void> cancelRequest(String requestId);
  Future<void> removeFriend(String userId);
  Future<DateTime> inviteToRoom({required String friendId, required String roomCode});
}
