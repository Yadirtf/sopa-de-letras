import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class WordChipsInputWidget extends StatefulWidget {
  final List<String> words;
  final ValueChanged<String> onAddWord;
  final ValueChanged<String> onRemoveWord;

  const WordChipsInputWidget({
    super.key,
    required this.words,
    required this.onAddWord,
    required this.onRemoveWord,
  });

  @override
  State<WordChipsInputWidget> createState() => _WordChipsInputWidgetState();
}

class _WordChipsInputWidgetState extends State<WordChipsInputWidget> {
  final TextEditingController _controller = TextEditingController();

  void _handleAdd() {
    String text = _controller.text.trim().toUpperCase();
    text = text
        .replaceAll(RegExp(r'[ÁÀÄÂ]'), 'A')
        .replaceAll(RegExp(r'[ÉÈËÊ]'), 'E')
        .replaceAll(RegExp(r'[ÍÌÏÎ]'), 'I')
        .replaceAll(RegExp(r'[ÓÒÖÔ]'), 'O')
        .replaceAll(RegExp(r'[ÚÙÜÛ]'), 'U')
        .replaceAll(RegExp(r'[^A-ZÑ]'), '');
    if (text.length >= 3 && text.length <= 15) {
      widget.onAddWord(text);
      _controller.clear();
    }
  }


  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final count = widget.words.length;
    final isCountValid = count >= 5 && count <= 20;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Palabras Clave', style: AppTypography.heading3.copyWith(fontSize: 15)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isCountValid
                    ? AppColors.accentEmerald.withValues(alpha: 0.15)
                    : AppColors.accentAmber.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isCountValid ? AppColors.accentEmerald : AppColors.accentAmber,
                ),
              ),
              child: Text(
                '$count/20 (Mín. 5)',
                style: AppTypography.caption.copyWith(
                  color: isCountValid ? AppColors.accentEmerald : AppColors.accentAmber,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                textCapitalization: TextCapitalization.characters,
                style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
                onSubmitted: (_) => _handleAdd(),
                decoration: InputDecoration(
                  hintText: 'Ingresa una palabra (3-15 letras)...',
                  hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.bgCard,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.borderSubtle),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.borderSubtle),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.accentCyan),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: _handleAdd,
              icon: const Icon(Icons.add_rounded),
              style: IconButton.styleFrom(
                backgroundColor: AppColors.accentViolet,
                foregroundColor: AppColors.textPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: widget.words.map((w) {
            return Chip(
              label: Text(w, style: AppTypography.caption.copyWith(color: AppColors.textPrimary)),
              backgroundColor: AppColors.bgCard,
              side: const BorderSide(color: AppColors.accentCyan),
              deleteIcon: const Icon(Icons.close_rounded, size: 14, color: AppColors.accentRose),
              onDeleted: () => widget.onRemoveWord(w),
            );
          }).toList(),
        ),
      ],
    );
  }
}
