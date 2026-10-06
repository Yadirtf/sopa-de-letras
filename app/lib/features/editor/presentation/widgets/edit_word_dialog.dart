import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

/// Diálogo para corregir una palabra ya agregada. [onSave] devuelve un
/// mensaje de error si la palabra no sirve; null si se guardó.
Future<void> showEditWordDialog(BuildContext context, String word, String? Function(String) onSave) {
  return showDialog<void>(context: context, builder: (_) => _EditWordDialog(word: word, onSave: onSave));
}

class _EditWordDialog extends StatefulWidget {
  final String word;
  final String? Function(String) onSave;

  const _EditWordDialog({required this.word, required this.onSave});

  @override
  State<_EditWordDialog> createState() => _EditWordDialogState();
}

class _EditWordDialogState extends State<_EditWordDialog> {
  late final _controller = TextEditingController(text: widget.word);
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _save() {
    final problem = widget.onSave(_controller.text);
    if (problem == null) {
      Navigator.of(context).pop();
    } else {
      setState(() => _error = problem);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.bgSecondary,
      title: Text('Corregir palabra', style: AppTypography.heading3),
      content: TextField(
        controller: _controller,
        autofocus: true,
        textCapitalization: TextCapitalization.characters,
        onSubmitted: (_) => _save(),
        style: AppTypography.bodyLarge.copyWith(color: AppColors.textPrimary, letterSpacing: 1.5),
        decoration: InputDecoration(errorText: _error),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancelar')),
        FilledButton(onPressed: _save, child: const Text('Guardar')),
      ],
    );
  }
}
