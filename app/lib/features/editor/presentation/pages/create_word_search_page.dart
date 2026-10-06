import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/editor_notifier.dart';
import '../providers/my_creations_notifier.dart';
import '../widgets/difficulty_selector_widget.dart';
import '../widgets/word_chips_input_widget.dart';
import '../widgets/interactive_grid_preview.dart';

class CreateWordSearchPage extends ConsumerStatefulWidget {
  const CreateWordSearchPage({super.key});

  @override
  ConsumerState<CreateWordSearchPage> createState() => _CreateWordSearchPageState();
}

class _CreateWordSearchPageState extends ConsumerState<CreateWordSearchPage> {
  final _titleController = TextEditingController();
  final _categoryController = TextEditingController(text: 'NATURALEZA');

  @override
  void dispose() {
    _titleController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    final notifier = ref.read(editorNotifierProvider.notifier);
    notifier.setTitle(_titleController.text);
    notifier.setCategory(_categoryController.text);

    final success = await notifier.submit();
    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('¡Sopa creada exitosamente!')),
      );
      notifier.reset();
      // Crear es una pestaña: no hay nada debajo a lo que volver. Mostramos
      // la sopa nueva en "Mis sopas", recargada para que aparezca.
      ref.read(myCreationsNotifierProvider.notifier).fetchMyCreations();
      context.go('/my-creations');
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(editorNotifierProvider);
    final notifier = ref.read(editorNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        title: Text('Crear Sopa de Letras', style: AppTypography.heading2.copyWith(fontSize: 18)),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          _buildTextField('Título de la Sopa', 'Ej. Animales del Bosque', _titleController),
          const SizedBox(height: 12),
          _buildTextField('Categoría Temática', 'Ej. CIENCIA, NATURALEZA', _categoryController),
          const SizedBox(height: 16),
          DifficultySelectorWidget(
            selectedDifficulty: state.difficulty,
            gridSize: state.gridSize,
            onDifficultyChanged: notifier.setDifficulty,
            onGridSizeChanged: notifier.setGridSize,
          ),
          const SizedBox(height: 16),
          WordChipsInputWidget(
            words: state.words,
            onAddWord: notifier.addWord,
            onRemoveWord: notifier.removeWord,
          ),
          if (state.errorMessage != null) ...[
            const SizedBox(height: 8),
            Text(state.errorMessage!, style: AppTypography.caption.copyWith(color: AppColors.accentRose)),
          ],
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: state.isGeneratingPreview ? null : notifier.generatePreview,
            icon: state.isGeneratingPreview
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.auto_fix_high_rounded),
            label: const Text('Generar y Previsualizar Matriz'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bgCard,
              foregroundColor: AppColors.accentCyan,
              side: const BorderSide(color: AppColors.accentCyan),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          if (state.preview != null) ...[
            const SizedBox(height: 16),
            InteractiveGridPreview(preview: state.preview!),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: state.isSubmitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentViolet,
                foregroundColor: AppColors.textPrimary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: state.isSubmitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Guardar y Publicar en Catálogo'),
            ),
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, String hint, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption.copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
            filled: true,
            fillColor: AppColors.bgCard,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderSubtle)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderSubtle)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.accentCyan)),
          ),
        ),
      ],
    );
  }
}
