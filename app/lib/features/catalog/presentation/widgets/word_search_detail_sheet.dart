import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/word_search_detail_entity.dart';
import 'spoiler_free_preview_widget.dart';

class WordSearchDetailSheet extends StatelessWidget {
  final WordSearchDetailEntity detail;
  final VoidCallback onPlaySolo;
  final VoidCallback onCreateMultiplayer;

  const WordSearchDetailSheet({
    super.key,
    required this.detail,
    required this.onPlaySolo,
    required this.onCreateMultiplayer,
  });

  static Future<void> show(
    BuildContext context, {
    required WordSearchDetailEntity detail,
    required VoidCallback onPlaySolo,
    required VoidCallback onCreateMultiplayer,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => WordSearchDetailSheet(
        detail: detail,
        onPlaySolo: onPlaySolo,
        onCreateMultiplayer: onCreateMultiplayer,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.82,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(top: BorderSide(color: AppColors.borderGlow, width: 1.5)),
          ),
          child: Column(
            children: [
              _buildDragHandle(),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    Text(detail.title, style: AppTypography.heading2),
                    const SizedBox(height: 6),
                    Text(
                      'Creado por ${detail.creatorName} • ${detail.category}',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.accentCyan),
                    ),
                    const SizedBox(height: 16),
                    // Matriz anti-spoilers
                    SpoilerFreePreviewWidget(
                      previewGrid: detail.previewGrid,
                      gridSize: detail.gridSize,
                    ),
                    const SizedBox(height: 20),
                    // Palabras a encontrar
                    Text(
                      'Palabras a Encontrar (${detail.words.length})',
                      style: AppTypography.heading3.copyWith(fontSize: 15),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: detail.words.map((w) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppColors.bgCard,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.borderSubtle),
                          ),
                          child: Text(
                            w,
                            style: AppTypography.caption.copyWith(color: AppColors.textPrimary),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                    // Botón Jugar Solitario
                    ElevatedButton.icon(
                      onPressed: onPlaySolo,
                      icon: const Icon(Icons.play_arrow_rounded, size: 24),
                      label: const Text('Jugar en Solitario'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentViolet,
                        foregroundColor: AppColors.textPrimary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Botón Crear Sala Multijugador
                    OutlinedButton.icon(
                      onPressed: onCreateMultiplayer,
                      icon: const Icon(Icons.groups_rounded, size: 20, color: AppColors.accentCyan),
                      label: Text(
                        'Crear Sala Multijugador',
                        style: AppTypography.button.copyWith(color: AppColors.accentCyan),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.accentCyan),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDragHandle() {
    return Container(
      width: 40,
      height: 4,
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.textMuted,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}
