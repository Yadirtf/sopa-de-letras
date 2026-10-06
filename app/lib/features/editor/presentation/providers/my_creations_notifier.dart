import 'package:equatable/equatable.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/my_word_search_entity.dart';
import '../../domain/usecases/get_my_word_searches_usecase.dart';
import '../../domain/usecases/delete_word_search_usecase.dart';
import 'editor_notifier.dart';

class MyCreationsState extends Equatable {
  final List<MyWordSearchEntity> items;
  final bool isLoading;
  final String? errorMessage;
  final String? successMessage;

  const MyCreationsState({
    this.items = const [],
    this.isLoading = false,
    this.errorMessage,
    this.successMessage,
  });

  MyCreationsState copyWith({
    List<MyWordSearchEntity>? items,
    bool? isLoading,
    String? errorMessage,
    String? successMessage,
  }) {
    return MyCreationsState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }

  @override
  List<Object?> get props => [items, isLoading, errorMessage, successMessage];
}

final getMyWordSearchesUseCaseProvider = Provider<GetMyWordSearchesUseCase>((ref) {
  return GetMyWordSearchesUseCase(ref.watch(editorRepositoryProvider));
});

final deleteWordSearchUseCaseProvider = Provider<DeleteWordSearchUseCase>((ref) {
  return DeleteWordSearchUseCase(ref.watch(editorRepositoryProvider));
});

final myCreationsNotifierProvider =
    StateNotifierProvider<MyCreationsNotifier, MyCreationsState>((ref) {
  final getMy = ref.watch(getMyWordSearchesUseCaseProvider);
  final deleteWs = ref.watch(deleteWordSearchUseCaseProvider);
  return MyCreationsNotifier(getMy, deleteWs);
});

class MyCreationsNotifier extends StateNotifier<MyCreationsState> {
  final GetMyWordSearchesUseCase _getMy;
  final DeleteWordSearchUseCase _deleteWs;

  MyCreationsNotifier(this._getMy, this._deleteWs)
      : super(const MyCreationsState()) {
    fetchMyCreations();
  }

  Future<void> fetchMyCreations() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final result = await _getMy();
    result.fold(
      (err) => state = state.copyWith(isLoading: false, errorMessage: err),
      (items) => state = state.copyWith(isLoading: false, items: items),
    );
  }

  Future<bool> delete(String id) async {
    final result = await _deleteWs(id);
    return result.fold(
      (err) {
        state = state.copyWith(errorMessage: err);
        return false;
      },
      (_) {
        state = state.copyWith(
          items: state.items.where((i) => i.id != id).toList(),
          successMessage: 'Sopa eliminada correctamente',
        );
        return true;
      },
    );
  }
}
