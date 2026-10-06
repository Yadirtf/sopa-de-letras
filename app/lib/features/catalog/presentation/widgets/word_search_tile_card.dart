import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/word_search_summary_entity.dart';
import 'catalog_visual_style.dart';
import 'letter_mosaic_widget.dart';
import 'word_search_tile_meta.dart';

/// Tarjeta del inicio: portada con letras del color de su categoría y, debajo,
/// lo que hace falta para decidir si jugarla (tamaño, palabras, dificultad y
/// quién la creó). Tocarla abre el detalle con los botones de jugar.
class WordSearchTileCard extends StatelessWidget {
  final WordSearchSummaryEntity item;
  final VoidCallback onTap;

  const WordSearchTileCard({super.key, required this.item, required this.onTap});

  bool get _isNew => DateTime.now().difference(item.createdAt).inDays < 3;

  @override
  Widget build(BuildContext context) {
    final category = CatalogVisualStyle.category(item.category);
    final difficulty = CatalogVisualStyle.difficulty(item.difficulty);

    return Semantics(
      button: true,
      label: '${item.title}, ${category.label}, ${difficulty.label}, ${item.wordCount} palabras',
      child: Material(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(20),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          splashColor: category.color.withValues(alpha: 0.18),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: category.color.withValues(alpha: 0.35)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _Cover(item: item, category: category, difficulty: difficulty, isNew: _isNew),
                Expanded(child: WordSearchTileMeta(item: item, accent: category.color)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Cover extends StatelessWidget {
  final WordSearchSummaryEntity item;
  final CatalogVisualStyle category;
  final CatalogVisualStyle difficulty;
  final bool isNew;

  const _Cover({required this.item, required this.category, required this.difficulty, required this.isNew});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 92,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [category.color.withValues(alpha: 0.28), AppColors.bgSecondary],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(8, 24, 8, 4),
              child: LetterMosaicWidget(seed: item.id, title: item.title, color: category.color),
            ),
          ),
          Positioned(left: 8, top: 8, child: _Pill(icon: category.icon, text: category.label, color: category.color)),
          Positioned(
            right: 8,
            top: 8,
            child: _Pill(icon: difficulty.icon, text: difficulty.label, color: difficulty.color),
          ),
          if (isNew)
            const Positioned(
              right: 8,
              bottom: 6,
              child: _Pill(icon: Icons.auto_awesome_rounded, text: 'Nueva', color: AppColors.accentAmber),
            ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;

  const _Pill({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary.withValues(alpha: 0.75),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 3),
          Text(text, style: AppTypography.caption.copyWith(fontSize: 10, color: color, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
