import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/realtime/social_socket_client.dart';
import '../../data/datasources/social_remote_datasource.dart';
import '../../data/repositories/social_repository_impl.dart';
import '../../domain/entities/room_invite_entity.dart';
import '../../domain/repositories/social_repository.dart';

final socialRepositoryProvider = Provider<SocialRepository>((ref) {
  return SocialRepositoryImpl(SocialRemoteDataSource(ApiClient()));
});

/// Un único socket social para toda la app; se cierra al destruir el ProviderScope.
final socialSocketProvider = Provider<SocialSocketClient>((ref) {
  final client = SocialSocketClient();
  ref.onDispose(client.dispose);
  return client;
});

/// Invitación que se está mostrando ahora mismo en el banner global.
final incomingInviteProvider = StateProvider<RoomInviteEntity?>((ref) => null);
