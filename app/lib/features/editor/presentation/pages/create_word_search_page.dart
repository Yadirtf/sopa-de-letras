import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/editor_notifier.dart';
import '../providers/editor_state.dart';
import '../providers/my_creations_notifier.dart';
import '../widgets/bulk_words_sheet.dart';
import '../widgets/category_picker_field.dart';
import '../widgets/difficulty_selector_widget.dart';
import '../widgets/edit_word_dialog.dart';
import '../widgets/editor_bottom_action.dart';
import '../widgets/editor_step_card.dart';
import '../widgets/editor_text_field.dart';
import '../widgets/interactive_grid_preview.dart';
import '../widgets/word_entry_bar.dart';
import '../widgets/word_list_panel.dart';

/// Crear una sopa en cuatro pasos numerados; el botón de abajo siempre dice qué sigue.
class CreateWordSearchPage extends ConsumerStatefulWidget {
  const CreateWordSearchPage({super.key});

  @override
  ConsumerState<CreateWordSearchPage> createState() => _CreateWordSearchPageState();
}

class _CreateWordSearchPageState extends ConsumerState<CreateWordSearchPage> {
  final _titleController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _pasteList(EditorState state) async {
    final words = await showBulkWordsSheet(context, existing: state.words);
    if (words != null) ref.read(editorNotifierProvider.notifier).addWords(words);
  }

  Future<void> _publish() async {
    final notifier = ref.read(editorNotifierProvider.notifier);
    final success = await notifier.submit();
    if (!mounted || !success) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('¡Tu sopa ya está publicada!')));
    notifier.reset();
    _titleController.clear();
    // Crear es una pestaña: no hay nada debajo a lo que volver. Mostramos
    // la sopa nueva en "Mis sopas", recargada para que aparezca.
    ref.read(myCreationsNotifierProvider.notifier).fetchMyCreations();
    context.go('/my-creations');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(editorNotifierProvider);
    final notifier = ref.read(editorNotifierProvider.notifier);
    final longest = state.words.fold<int>(10, (m, w) => w.length > m ? w.length : m);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      bottomNavigationBar: EditorBottomAction(state: state, onPreview: notifier.generatePreview, onPublish: _publish),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            Text('Crea tu sopa de letras', style: AppTypography.heading2),
            const SizedBox(height: 4),
            Text('Cuatro pasos y lista para jugar con tus amigos.',
                style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 18),
            EditorStepCard(
              step: 1,
              title: 'Nombre y tema',
              done: state.hasTitle && state.category != null,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  EditorTextField(
                    controller: _titleController,
                    label: 'Nombre de tu sopa',
                    hint: 'Ej. Animales del bosque',
                    onChanged: notifier.setTitle,
                  ),
                  const SizedBox(height: 12),
                  CategoryPickerField(selected: state.category, onChanged: notifier.setCategory),
                ],
              ),
            ),
            EditorStepCard(
              step: 2,
              title: 'Palabras escondidas',
              subtitle: 'De ${EditorState.minWords} a ${EditorState.maxWords} palabras, de 3 a 15 letras',
              done: state.hasEnoughWords,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  WordEntryBar(
                    isFull: state.words.length >= EditorState.maxWords,
                    onSubmit: notifier.addFromText,
                    onPasteList: () => _pasteList(state),
                  ),
                  const SizedBox(height: 16),
                  WordListPanel(
                    words: state.words,
                    onEdit: (w) => showEditWordDialog(context, w, (raw) => notifier.replaceWord(w, raw)),
                    onRemove: notifier.removeWord,
                    onClear: notifier.clearWords,
                  ),
                ],
              ),
            ),
            EditorStepCard(
              step: 3,
              title: 'Dificultad y tamaño',
              done: state.isReadyToPreview,
              child: DifficultySelectorWidget(
                selectedDifficulty: state.difficulty,
                gridSize: state.gridSize,
                minGridSize: longest,
                onDifficultyChanged: notifier.setDifficulty,
                onGridSizeChanged: notifier.setGridSize,
              ),
            ),
            EditorStepCard(
              step: 4,
              title: 'Mira cómo queda',
              done: state.preview != null,
              child: state.preview == null
                  ? Text('Cuando tengas todo, toca «Ver cómo queda» abajo.',
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        InteractiveGridPreview(preview: state.preview!),
                        TextButton.icon(
                          onPressed: state.isGeneratingPreview ? null : notifier.generatePreview,
                          icon: const Icon(Icons.shuffle_rounded),
                          label: const Text('Mezclar de nuevo'),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
