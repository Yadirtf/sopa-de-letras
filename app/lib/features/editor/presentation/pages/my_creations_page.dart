import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/my_creations_notifier.dart';

class MyCreationsPage extends ConsumerWidget {
  const MyCreationsPage({super.key});

  void _confirmDelete(BuildContext context, WidgetRef ref, String id, String title) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: Text('¿Eliminar "$title"?', style: AppTypography.heading3.copyWith(fontSize: 16)),
        content: Text(
          'Esta acción es irreversible y eliminará la sopa de letras del catálogo.',
          style: AppTypography.bodySmall,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRose),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final success = await ref.read(myCreationsNotifierProvider.notifier).delete(id);
              if (context.mounted && success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sopa de letras eliminada')),
                );
              }
            },
            child: const Text('Eliminar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(myCreationsNotifierProvider);
    final notifier = ref.read(myCreationsNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        title: Text('Mis Creaciones', style: AppTypography.heading2.copyWith(fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.accentCyan),
            onPressed: () => context.go('/create-word-search'),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
          : state.items.isEmpty
              ? _buildEmptyState(context)
              : RefreshIndicator(
                  color: AppColors.accentCyan,
                  backgroundColor: AppColors.bgCard,
                  onRefresh: notifier.fetchMyCreations,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: state.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = state.items[index];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.bgCard,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.borderSubtle),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.title, style: AppTypography.labelBold),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item.category} • ${item.difficulty} • ${item.gridSize}x${item.gridSize}',
                                    style: AppTypography.caption.copyWith(color: AppColors.accentCyan),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item.wordCount} palabras • ${item.playCount} partidas',
                                    style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.accentRose),
                              onPressed: () => _confirmDelete(context, ref, item.id, item.title),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.dashboard_customize_outlined, size: 64, color: AppColors.textMuted),
          const SizedBox(height: 16),
          Text('No has creado sopas aún', style: AppTypography.heading3),
          const SizedBox(height: 8),
          Text(
            '¡Diseña tu primera sopa de letras y compártela!',
            style: AppTypography.bodySmall,
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => context.go('/create-word-search'),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Crear Sopa Ahora'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentViolet,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
