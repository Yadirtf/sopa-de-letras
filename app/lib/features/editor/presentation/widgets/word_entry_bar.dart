import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/services/word_bulk_parser.dart';

/// Campo para escribir palabras. Acepta una sola o varias separadas por
/// comas (si pegan una lista aquí también funciona) y cuenta qué pasó.
class WordEntryBar extends StatefulWidget {
  final bool isFull;
  final WordBulkParseResult Function(String text) onSubmit;
  final VoidCallback onPasteList;

  const WordEntryBar({super.key, required this.isFull, required this.onSubmit, required this.onPasteList});

  @override
  State<WordEntryBar> createState() => _WordEntryBarState();
}

class _WordEntryBarState extends State<WordEntryBar> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  String? _feedback;
  bool _feedbackIsError = false;

  @override
  void dispose() {
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _submit() {
    if (_controller.text.trim().isEmpty) return;
    final result = widget.onSubmit(_controller.text);
    final parts = <String>[
      if (result.words.isNotEmpty) '${result.words.length} agregada${result.words.length == 1 ? '' : 's'}',
      if (result.duplicates.isNotEmpty)
        '${result.duplicates.length} repetida${result.duplicates.length == 1 ? '' : 's'}',
      for (final r in result.rejected) '${r.raw}: ${r.reason.toLowerCase()}',
      if (result.overLimit > 0) 'ya no caben más',
    ];
    setState(() {
      _feedback = parts.join(' · ');
      _feedbackIsError = result.words.isEmpty;
      // Si nada entró, se deja el texto para que la persona lo corrija.
      if (result.words.isNotEmpty) _controller.clear();
    });
    _focus.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                focusNode: _focus,
                enabled: !widget.isFull,
                textCapitalization: TextCapitalization.characters,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
                style: AppTypography.bodyLarge.copyWith(color: AppColors.textPrimary, letterSpacing: 1.2),
                decoration: InputDecoration(
                  hintText: widget.isFull ? 'Llegaste a 20 palabras' : 'Ej. león, tigre, jirafa',
                  hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.bgSecondary,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.5),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              tooltip: 'Agregar',
              onPressed: widget.isFull ? null : _submit,
              icon: const Icon(Icons.add_rounded),
              iconSize: 26,
              style: IconButton.styleFrom(
                backgroundColor: AppColors.accentViolet,
                foregroundColor: AppColors.textPrimary,
                minimumSize: const Size(52, 52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
        if (_feedback != null && _feedback!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 4),
            child: Text(
              _feedback!,
              style: AppTypography.caption.copyWith(
                color: _feedbackIsError ? AppColors.accentAmber : AppColors.accentEmerald,
              ),
            ),
          ),
        const SizedBox(height: 10),
        OutlinedButton.icon(
          onPressed: widget.isFull ? null : widget.onPasteList,
          icon: const Icon(Icons.content_paste_go_rounded),
          label: const Text('Pegar una lista de palabras'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.accentCyan,
            side: const BorderSide(color: AppColors.accentCyan),
            minimumSize: const Size.fromHeight(46),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
      ],
    );
  }
}
