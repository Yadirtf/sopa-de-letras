import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/editor_state.dart';

/// Palabras ya agregadas con un medidor de cuántas faltan / caben.
/// Tocar una palabra permite corregirla; la ✕ la quita.
class WordListPanel extends StatelessWidget {
  final List<String> words;
  final ValueChanged<String> onEdit;
  final ValueChanged<String> onRemove;
  final VoidCallback onClear;

  const WordListPanel({
    super.key,
    required this.words,
    required this.onEdit,
    required this.onRemove,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    final count = words.length;
    final missing = EditorState.minWords - count;
    final color = missing > 0 ? AppColors.accentAmber : AppColors.accentEmerald;
    final message = count == 0
        ? 'Necesitas al menos ${EditorState.minWords} palabras'
        : missing > 0
            ? 'Te falta${missing == 1 ? '' : 'n'} $missing para poder jugar'
            : count == EditorState.maxWords
                ? '¡Lista completa!'
                : '¡Bien! Puedes agregar hasta ${EditorState.maxWords - count} más';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Text(message, style: AppTypography.labelBold.copyWith(color: color))),
            Text('$count/${EditorState.maxWords}',
                style:
                    AppTypography.labelBold.copyWith(color: color, fontFeatures: const [FontFeature.tabularFigures()])),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: count / EditorState.maxWords,
            minHeight: 8,
            color: color,
            backgroundColor: AppColors.bgSecondary,
          ),
        ),
        if (words.isNotEmpty) ...[
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [for (final w in words) _WordChip(word: w, onEdit: onEdit, onRemove: onRemove)],
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: onClear,
              icon: const Icon(Icons.delete_sweep_rounded, size: 18),
              label: const Text('Quitar todas'),
              style: TextButton.styleFrom(foregroundColor: AppColors.textSecondary),
            ),
          ),
        ],
      ],
    );
  }
}

class _WordChip extends StatelessWidget {
  final String word;
  final ValueChanged<String> onEdit;
  final ValueChanged<String> onRemove;

  const _WordChip({required this.word, required this.onEdit, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return InputChip(
      label: Text(word),
      labelStyle: AppTypography.labelBold.copyWith(color: AppColors.textPrimary, letterSpacing: 1),
      backgroundColor: AppColors.bgSecondary,
      side: const BorderSide(color: AppColors.accentCyan),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      onPressed: () => onEdit(word),
      tooltip: 'Toca para corregir',
      deleteIcon: const Icon(Icons.close_rounded, size: 18, color: AppColors.accentRose),
      deleteButtonTooltipMessage: 'Quitar $word',
      onDeleted: () => onRemove(word),
    );
  }
}
