import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/services/word_bulk_parser.dart';

/// Vista previa de lo que se pegó: qué entra, qué se repite y qué no sirve.
/// Tocar una palabra válida la deja fuera (y otro toque la vuelve a incluir).
class BulkWordsPreview extends StatelessWidget {
  final WordBulkParseResult result;
  final Set<String> excluded;
  final ValueChanged<String> onToggle;

  const BulkWordsPreview({super.key, required this.result, required this.excluded, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (result.words.isNotEmpty)
          _Group(
            title: 'Se agregarán (${result.words.length - excluded.length})',
            hint: 'Toca una palabra para dejarla fuera',
            color: AppColors.accentEmerald,
            chips: [
              for (final w in result.words)
                _PreviewChip(
                    label: w, color: AppColors.accentEmerald, off: excluded.contains(w), onTap: () => onToggle(w)),
            ],
          ),
        if (result.duplicates.isNotEmpty)
          _Group(
            title: 'Repetidas, no se agregan (${result.duplicates.length})',
            color: AppColors.accentAmber,
            chips: [for (final w in result.duplicates) _PreviewChip(label: w, color: AppColors.accentAmber)],
          ),
        if (result.rejected.isNotEmpty)
          _Group(
            title: 'Hay que corregirlas en el texto (${result.rejected.length})',
            color: AppColors.accentRose,
            chips: [
              for (final r in result.rejected)
                _PreviewChip(label: '${r.raw} · ${r.reason}', color: AppColors.accentRose),
            ],
          ),
        if (result.overLimit > 0)
          Text('${result.overLimit} palabra(s) no caben: el máximo es ${WordBulkParser.maxWords}.',
              style: AppTypography.caption.copyWith(color: AppColors.accentAmber)),
      ],
    );
  }
}

class _Group extends StatelessWidget {
  final String title;
  final String? hint;
  final Color color;
  final List<Widget> chips;

  const _Group({required this.title, required this.color, required this.chips, this.hint});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTypography.labelBold.copyWith(color: color)),
          if (hint != null) Text(hint!, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Wrap(spacing: 6, runSpacing: 6, children: chips),
        ],
      ),
    );
  }
}

class _PreviewChip extends StatelessWidget {
  final String label;
  final Color color;
  final bool off;
  final VoidCallback? onTap;

  const _PreviewChip({required this.label, required this.color, this.off = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    final tint = off ? AppColors.textMuted : color;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: tint.withValues(alpha: off ? 0.08 : 0.15),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: tint),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            color: off ? AppColors.textMuted : AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            decoration: off ? TextDecoration.lineThrough : null,
          ),
        ),
      ),
    );
  }
}
