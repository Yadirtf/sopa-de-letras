import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_error.dart';
import '../../domain/entities/social_entities.dart';
import '../../domain/repositories/social_repository.dart';
import 'social_providers.dart';

class PlayerSearchState {
  final String query;
  final List<PlayerSearchResultEntity> results;
  final bool isSearching;
  final Set<String> busyIds;

  const PlayerSearchState({this.query = '', this.results = const [], this.isSearching = false, this.busyIds = const {}});

  bool get isTooShort => query.trim().length < 2;

  PlayerSearchState copyWith({String? query, List<PlayerSearchResultEntity>? results, bool? isSearching, Set<String>? busyIds}) =>
      PlayerSearchState(
        query: query ?? this.query,
        results: results ?? this.results,
        isSearching: isSearching ?? this.isSearching,
        busyIds: busyIds ?? this.busyIds,
      );
}

final playerSearchNotifierProvider =
    StateNotifierProvider.autoDispose<PlayerSearchNotifier, PlayerSearchState>((ref) {
  return PlayerSearchNotifier(ref.watch(socialRepositoryProvider));
});

/// Buscador reactivo con debounce: espera a que el jugador deje de teclear
/// 350 ms para no disparar una petición por letra (amable con dedos lentos).
class PlayerSearchNotifier extends StateNotifier<PlayerSearchState> {
  final SocialRepository _repo;
  final Duration debounce;
  Timer? _timer;

  PlayerSearchNotifier(this._repo, {this.debounce = const Duration(milliseconds: 350)})
      : super(const PlayerSearchState());

  void onQueryChanged(String query) {
    _timer?.cancel();
    state = state.copyWith(query: query);
    if (state.isTooShort) {
      state = state.copyWith(results: const [], isSearching: false);
      return;
    }
    state = state.copyWith(isSearching: true);
    _timer = Timer(debounce, () => _search(query));
  }

  Future<void> _search(String query) async {
    try {
      final results = await _repo.searchPlayers(query.trim());
      if (mounted && state.query == query) state = state.copyWith(results: results, isSearching: false);
    } catch (_) {
      if (mounted) state = state.copyWith(results: const [], isSearching: false);
    }
  }

  /// "Agregar" (o "Aceptar" si ya nos había agregado: el backend lo resuelve).
  Future<String> add(String userId) async {
    state = state.copyWith(busyIds: {...state.busyIds, userId});
    try {
      final outcome = await _repo.sendRequest(userId);
      final relation = outcome == FriendRequestOutcome.accepted ? RelationStatus.friends : RelationStatus.requestSent;
      _setRelation(userId, relation);
      return outcome == FriendRequestOutcome.accepted ? '¡Ahora son amigos!' : 'Solicitud enviada';
    } catch (e) {
      return friendlyApiError(e);
    } finally {
      if (mounted) state = state.copyWith(busyIds: {...state.busyIds}..remove(userId));
    }
  }

  void _setRelation(String userId, RelationStatus relation) {
    state = state.copyWith(
      results: state.results.map((r) => r.id == userId ? r.withRelation(relation) : r).toList(),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
