import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/catalog_notifier.dart';
import '../widgets/catalog_search_bar.dart';
import '../widgets/catalog_filter_chips.dart';
import '../widgets/catalog_card_widget.dart';
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
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 250) {
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
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Explorar Sopas', style: AppTypography.heading2.copyWith(fontSize: 20)),
        actions: [
          IconButton(
            icon: const Icon(Icons.group_add_rounded, color: AppColors.accentEmerald),
            tooltip: 'Unirse a Sala',
            onPressed: () => context.push('/join-room'),
          ),
          IconButton(
            icon: const Icon(Icons.auto_awesome_motion_rounded, color: AppColors.accentAmber),
            tooltip: 'Mis Creaciones',
            onPressed: () => context.push('/my-creations'),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline_rounded, color: AppColors.accentCyan),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.accentViolet,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Crear Sopa'),
        onPressed: () => context.push('/create-word-search'),
      ),
      body: Column(
        children: [
          CatalogSearchBar(
            initialValue: state.searchQuery,
            onSearchChanged: notifier.setSearch,
          ),
          CatalogFilterChips(
            selectedCategory: state.selectedCategory,
            selectedDifficulty: state.selectedDifficulty,
            onCategorySelected: notifier.setCategory,
            onDifficultySelected: notifier.setDifficulty,
          ),
          const SizedBox(height: 8),
          Expanded(
            child: state.isLoading
                ? const CatalogSkeletonWidget()
                : state.items.isEmpty
                    ? CatalogEmptyState(onClearFilters: notifier.clearFilters)
                    : RefreshIndicator(
                        color: AppColors.accentCyan,
                        backgroundColor: AppColors.bgCard,
                        onRefresh: notifier.fetchInitialCatalog,
                        child: ListView.builder(
                          controller: _scrollController,
                          itemCount: state.items.length + (state.isLoadingMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == state.items.length) {
                              return const Padding(
                                padding: EdgeInsets.symmetric(vertical: 16),
                                child: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
                              );
                            }
                            final item = state.items[index];
                            return CatalogCardWidget(
                              item: item,
                              onTap: () => _openDetail(item.id),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
