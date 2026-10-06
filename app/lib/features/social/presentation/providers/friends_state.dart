import 'package:equatable/equatable.dart';
import '../../domain/entities/social_entities.dart';

class FriendsState extends Equatable {
  final List<FriendEntity> friends;
  final List<FriendRequestEntity> incoming;
  final List<FriendRequestEntity> outgoing;
  final bool isLoading;
  final String? errorMessage;

  /// Ids (de solicitud o de amigo) con una acción en curso, para deshabilitar sus botones.
  final Set<String> busyIds;

  const FriendsState({
    this.friends = const [],
    this.incoming = const [],
    this.outgoing = const [],
    this.isLoading = false,
    this.errorMessage,
    this.busyIds = const {},
  });

  int get availableCount => friends.where((f) => f.status.isAvailable).length;
  List<FriendEntity> get onlineFriends => friends.where((f) => f.status == PresenceStatus.online).toList();

  FriendsState copyWith({
    List<FriendEntity>? friends,
    List<FriendRequestEntity>? incoming,
    List<FriendRequestEntity>? outgoing,
    bool? isLoading,
    String? errorMessage,
    Set<String>? busyIds,
  }) {
    return FriendsState(
      friends: friends ?? this.friends,
      incoming: incoming ?? this.incoming,
      outgoing: outgoing ?? this.outgoing,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      busyIds: busyIds ?? this.busyIds,
    );
  }

  @override
  List<Object?> get props => [friends, incoming, outgoing, isLoading, errorMessage, busyIds];
}
