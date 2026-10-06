import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/catalog_notifier.dart';
import '../widgets/catalog_search_bar.dart';
import '../widgets/catalog_filter_chips.dart';
import '../widgets/catalog_grid_delegate.dart';
import '../widgets/word_search_tile_card.dart';
import '../widgets/catalog_skeleton_widget.dart';
import '../widgets/catalog_empty_state.dart';
import '../widgets/word_search_detail_sheet.dart';

class CatalogPage extends ConsumerStatefulWidget {
  const CatalogPage({super.key});

  @override
  ConsumerState<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends ConsumerState<CatalogPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 250) {
      ref.read(catalogNotifierProvider.notifier).loadMore();
    }
  }

  void _openDetail(String id) async {
    final notifier = ref.read(catalogNotifierProvider.notifier);
    await notifier.loadDetail(id);
    if (!mounted) return;
    final state = ref.read(catalogNotifierProvider);
    if (state.selectedDetail != null) {
      final detail = state.selectedDetail!;
      WordSearchDetailSheet.show(
        context,
        detail: detail,
        onPlaySolo: () {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Modo Solitario próximamente en Épica 3')),
          );
        },
        onCreateMultiplayer: () {
          Navigator.of(context).pop();
          context.push('/create-room', extra: {
            'wordSearchId': detail.id,
            'wordSearchTitle': detail.title,
          });
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(catalogNotifierProvider);
    final notifier = ref.read(catalogNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      // El saludo, Amigos y la campana viven en la barra común del marco.
      body: RefreshIndicator(
        color: AppColors.accentCyan,
        backgroundColor: AppColors.bgCard,
        onRefresh: notifier.fetchInitialCatalog,
        child: CustomScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: CatalogSearchBar(initialValue: state.searchQuery, onSearchChanged: notifier.setSearch),
            ),
            SliverToBoxAdapter(
              child: CatalogFilterChips(
                selectedCategory: state.selectedCategory,
                selectedDifficulty: state.selectedDifficulty,
                onCategorySelected: notifier.setCategory,
                onDifficultySelected: notifier.setDifficulty,
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 12)),
            if (state.isLoading)
              const CatalogSkeletonWidget()
            else if (state.items.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: CatalogEmptyState(onClearFilters: notifier.clearFilters),
              )
            else
              SliverPadding(
                padding: catalogGridPadding,
                sliver: SliverGrid(
                  gridDelegate: catalogGridDelegate,
                  delegate: SliverChildBuilderDelegate(
                    childCount: state.items.length,
                    (context, index) {
                      final item = state.items[index];
                      return WordSearchTileCard(item: item, onTap: () => _openDetail(item.id));
                    },
                  ),
                ),
              ),
            if (state.isLoadingMore)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.only(bottom: 24),
                  child: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
