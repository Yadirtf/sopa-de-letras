import '../../domain/entities/social_entities.dart';
import '../../domain/repositories/social_repository.dart';
import '../datasources/social_remote_datasource.dart';
import '../models/social_models.dart';

class SocialRepositoryImpl implements SocialRepository {
  final SocialRemoteDataSource _remote;

  SocialRepositoryImpl(this._remote);

  @override
  Future<List<FriendEntity>> getFriends() async =>
      SocialModels.list((await _remote.getFriends())['friends'], SocialModels.friend);

  @override
  Future<List<PlayerSearchResultEntity>> searchPlayers(String term) async =>
      SocialModels.list(await _remote.search(term), SocialModels.searchResult);

  @override
  Future<({List<FriendRequestEntity> incoming, List<FriendRequestEntity> outgoing})> getRequests() async {
    final json = await _remote.getRequests();
    return (
      incoming: SocialModels.list(json['incoming'], SocialModels.request),
      outgoing: SocialModels.list(json['outgoing'], SocialModels.request),
    );
  }

  @override
  Future<FriendRequestOutcome> sendRequest(String userId) async {
    final json = await _remote.sendRequest(userId);
    return json['status'] == 'ACCEPTED' ? FriendRequestOutcome.accepted : FriendRequestOutcome.pending;
  }

  @override
  Future<void> acceptRequest(String requestId) => _remote.respond(requestId, 'ACCEPT');

  @override
  Future<void> rejectRequest(String requestId) => _remote.respond(requestId, 'REJECT');

  @override
  Future<void> cancelRequest(String requestId) => _remote.respond(requestId, 'CANCEL');

  @override
  Future<void> removeFriend(String userId) => _remote.removeFriend(userId);

  @override
  Future<DateTime> inviteToRoom({required String friendId, required String roomCode}) async {
    final json = await _remote.invite(friendId, roomCode);
    final millis = (json['expiresAt'] as num?)?.toInt();
    return millis != null
        ? DateTime.fromMillisecondsSinceEpoch(millis)
        : DateTime.now().add(const Duration(seconds: 15));
  }
}
