import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/services/word_bulk_parser.dart';
import 'bulk_words_preview.dart';

/// Hoja para pegar muchas palabras de una vez (por ejemplo, lo que devuelve
/// una IA). Muestra en vivo qué se va a agregar antes de confirmar.
Future<List<String>?> showBulkWordsSheet(BuildContext context, {required List<String> existing}) {
  return showModalBottomSheet<List<String>>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: AppColors.bgSecondary,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (_) => _BulkWordsSheet(existing: existing),
  );
}

class _BulkWordsSheet extends StatefulWidget {
  final List<String> existing;

  const _BulkWordsSheet({required this.existing});

  @override
  State<_BulkWordsSheet> createState() => _BulkWordsSheetState();
}

class _BulkWordsSheetState extends State<_BulkWordsSheet> {
  final _controller = TextEditingController();
  final _excluded = <String>{};
  late WordBulkParseResult _result = WordBulkParser.parse('', existing: widget.existing);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _reparse() => setState(() => _result = WordBulkParser.parse(_controller.text, existing: widget.existing));

  Future<void> _pasteFromClipboard() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final text = data?.text ?? '';
    if (text.isEmpty) return;
    final current = _controller.text.trim();
    _controller.text = current.isEmpty ? text : '$current\n$text';
    _reparse();
  }

  @override
  Widget build(BuildContext context) {
    final toAdd = _result.words.where((w) => !_excluded.contains(w)).toList();
    final room = WordBulkParser.maxWords - widget.existing.length;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
        child: ListView(
          shrinkWrap: true,
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
          children: [
            Text('Pegar varias palabras', style: AppTypography.heading3),
            const SizedBox(height: 4),
            Text(
              'Sepáralas con comas, una por línea o en lista numerada. '
              'Quitamos tildes, números y repetidas por ti. Aún caben $room.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _controller,
              autofocus: true,
              minLines: 4,
              maxLines: 8,
              onChanged: (_) => _reparse(),
              style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'león, tigre, jirafa…\n\n1. Elefante\n2. Cebra',
                filled: true,
                fillColor: AppColors.bgCard,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: _pasteFromClipboard,
                icon: const Icon(Icons.content_paste_rounded),
                label: const Text('Pegar lo copiado'),
              ),
            ),
            const SizedBox(height: 8),
            BulkWordsPreview(
              result: _result,
              excluded: _excluded,
              onToggle: (w) => setState(() => _excluded.contains(w) ? _excluded.remove(w) : _excluded.add(w)),
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: toAdd.isEmpty ? null : () => Navigator.of(context).pop(toAdd),
              icon: const Icon(Icons.playlist_add_check_rounded),
              label: Text(toAdd.isEmpty
                  ? 'Escribe o pega tus palabras'
                  : 'Agregar ${toAdd.length} ${toAdd.length == 1 ? 'palabra' : 'palabras'}'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accentViolet,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
