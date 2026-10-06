import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../data/datasources/catalog_remote_datasource.dart';
import '../../data/repositories/catalog_repository_impl.dart';
import '../../domain/repositories/catalog_repository.dart';
import '../../domain/usecases/get_catalog_usecase.dart';
import '../../domain/usecases/get_word_search_detail_usecase.dart';
import 'catalog_state.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  final apiClient = ApiClient();
  final remoteDs = CatalogRemoteDataSource(apiClient);
  return CatalogRepositoryImpl(remoteDs);
});

final getCatalogUseCaseProvider = Provider<GetCatalogUseCase>((ref) {
  return GetCatalogUseCase(ref.watch(catalogRepositoryProvider));
});

final getWordSearchDetailUseCaseProvider =
    Provider<GetWordSearchDetailUseCase>((ref) {
  return GetWordSearchDetailUseCase(ref.watch(catalogRepositoryProvider));
});

final catalogNotifierProvider =
    StateNotifierProvider<CatalogNotifier, CatalogState>((ref) {
  final getCatalog = ref.watch(getCatalogUseCaseProvider);
  final getDetail = ref.watch(getWordSearchDetailUseCaseProvider);
  return CatalogNotifier(getCatalog, getDetail);
});

class CatalogNotifier extends StateNotifier<CatalogState> {
  final GetCatalogUseCase _getCatalog;
  final GetWordSearchDetailUseCase _getDetail;

  CatalogNotifier(this._getCatalog, this._getDetail)
      : super(const CatalogState()) {
    fetchInitialCatalog();
  }

  Future<void> fetchInitialCatalog() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final result = await _getCatalog(
      cursor: null,
      limit: 12,
      category: state.selectedCategory,
      difficulty: state.selectedDifficulty,
      search: state.searchQuery,
    );

    result.fold(
      (err) => state = state.copyWith(isLoading: false, errorMessage: err),
      (data) => state = state.copyWith(
        isLoading: false,
        items: data.items,
        nextCursor: data.nextCursor,
        totalCount: data.totalCount,
        hasMore: data.hasMore,
      ),
    );
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) return;
    state = state.copyWith(isLoadingMore: true);

    final result = await _getCatalog(
      cursor: state.nextCursor,
      limit: 12,
      category: state.selectedCategory,
      difficulty: state.selectedDifficulty,
      search: state.searchQuery,
    );

    result.fold(
      (err) => state = state.copyWith(isLoadingMore: false),
      (data) => state = state.copyWith(
        isLoadingMore: false,
        items: [...state.items, ...data.items],
        nextCursor: data.nextCursor,
        totalCount: data.totalCount,
        hasMore: data.hasMore,
      ),
    );
  }

  void setCategory(String category) {
    if (state.selectedCategory == category) return;
    state = state.copyWith(selectedCategory: category);
    fetchInitialCatalog();
  }

  void setDifficulty(String difficulty) {
    if (state.selectedDifficulty == difficulty) return;
    state = state.copyWith(selectedDifficulty: difficulty);
    fetchInitialCatalog();
  }

  void setSearch(String query) {
    state = state.copyWith(searchQuery: query);
    fetchInitialCatalog();
  }

  void clearFilters() {
    state = state.copyWith(
      selectedCategory: 'TODAS',
      selectedDifficulty: 'TODAS',
      searchQuery: '',
    );
    fetchInitialCatalog();
  }

  Future<void> loadDetail(String id) async {
    state = state.copyWith(
      isLoadingDetail: true,
      detailErrorMessage: null,
      selectedDetail: null,
    );
    final result = await _getDetail(id);
    result.fold(
      (err) => state = state.copyWith(
        isLoadingDetail: false,
        detailErrorMessage: err,
      ),
      (detail) => state = state.copyWith(
        isLoadingDetail: false,
        selectedDetail: detail,
      ),
    );
  }
}
