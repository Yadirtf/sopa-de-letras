import 'package:equatable/equatable.dart';
import '../../domain/entities/word_search_summary_entity.dart';
import '../../domain/entities/word_search_detail_entity.dart';

class CatalogState extends Equatable {
  final List<WordSearchSummaryEntity> items;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final String? nextCursor;
  final int totalCount;
  final String selectedCategory;
  final String selectedDifficulty;
  final String searchQuery;
  final String? errorMessage;
  final WordSearchDetailEntity? selectedDetail;
  final bool isLoadingDetail;
  final String? detailErrorMessage;

  const CatalogState({
    this.items = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.nextCursor,
    this.totalCount = 0,
    this.selectedCategory = 'TODAS',
    this.selectedDifficulty = 'TODAS',
    this.searchQuery = '',
    this.errorMessage,
    this.selectedDetail,
    this.isLoadingDetail = false,
    this.detailErrorMessage,
  });

  CatalogState copyWith({
    List<WordSearchSummaryEntity>? items,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMore,
    String? nextCursor,
    int? totalCount,
    String? selectedCategory,
    String? selectedDifficulty,
    String? searchQuery,
    String? errorMessage,
    WordSearchDetailEntity? selectedDetail,
    bool? isLoadingDetail,
    String? detailErrorMessage,
  }) {
    return CatalogState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      nextCursor: nextCursor ?? this.nextCursor,
      totalCount: totalCount ?? this.totalCount,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedDifficulty: selectedDifficulty ?? this.selectedDifficulty,
      searchQuery: searchQuery ?? this.searchQuery,
      errorMessage: errorMessage,
      selectedDetail: selectedDetail ?? this.selectedDetail,
      isLoadingDetail: isLoadingDetail ?? this.isLoadingDetail,
      detailErrorMessage: detailErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        items,
        isLoading,
        isLoadingMore,
        hasMore,
        nextCursor,
        totalCount,
        selectedCategory,
        selectedDifficulty,
        searchQuery,
        errorMessage,
        selectedDetail,
        isLoadingDetail,
        detailErrorMessage,
      ];
}
