import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_error.dart';
import '../../domain/entities/social_entities.dart';
import '../../domain/repositories/social_repository.dart';
import 'friends_state.dart';
import 'social_providers.dart';

final friendsNotifierProvider = StateNotifierProvider<FriendsNotifier, FriendsState>((ref) {
  return FriendsNotifier(ref.watch(socialRepositoryProvider));
});

/// Amigos + solicitudes (US-22, US-23). Cada acción devuelve un mensaje
/// corto listo para un SnackBar, o null si salió bien sin nada que decir.
class FriendsNotifier extends StateNotifier<FriendsState> {
  final SocialRepository _repo;

  FriendsNotifier(this._repo) : super(const FriendsState());

  Future<void> load({bool silent = false}) async {
    if (!silent) state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([_repo.getFriends(), _repo.getRequests()]);
      final requests = results[1] as ({List<FriendRequestEntity> incoming, List<FriendRequestEntity> outgoing});
      state = state.copyWith(
        friends: _sorted(results[0] as List<FriendEntity>),
        incoming: requests.incoming,
        outgoing: requests.outgoing,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: friendlyApiError(e));
    }
  }

  /// Llega por socket (`friend:presence`): sin peticiones HTTP.
  void applyPresence(String userId, PresenceStatus status) {
    if (!state.friends.any((f) => f.id == userId)) return;
    final updated = state.friends.map((f) => f.id == userId ? f.withStatus(status) : f).toList();
    state = state.copyWith(friends: _sorted(updated));
  }

  Future<String?> accept(String requestId) =>
      _run(requestId, () => _repo.acceptRequest(requestId), success: '¡Ahora son amigos! 🎉');

  Future<String?> reject(String requestId) => _run(requestId, () => _repo.rejectRequest(requestId));

  Future<String?> cancel(String requestId) => _run(requestId, () => _repo.cancelRequest(requestId));

  Future<String?> remove(String userId) => _run(userId, () => _repo.removeFriend(userId));

  void reset() => state = const FriendsState();

  Future<String?> _run(String id, Future<void> Function() action, {String? success}) async {
    state = state.copyWith(busyIds: {...state.busyIds, id});
    try {
      await action();
      await load(silent: true);
      return success;
    } catch (e) {
      return friendlyApiError(e);
    } finally {
      state = state.copyWith(busyIds: {...state.busyIds}..remove(id));
    }
  }

  static const _weight = {PresenceStatus.online: 0, PresenceStatus.playing: 1, PresenceStatus.offline: 2};

  List<FriendEntity> _sorted(List<FriendEntity> list) => [...list]
    ..sort((a, b) {
      final byStatus = _weight[a.status]!.compareTo(_weight[b.status]!);
      return byStatus != 0 ? byStatus : a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
}
