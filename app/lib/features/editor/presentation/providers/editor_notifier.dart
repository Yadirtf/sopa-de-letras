import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../data/datasources/editor_remote_datasource.dart';
import '../../data/repositories/editor_repository_impl.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/repositories/editor_repository.dart';
import '../../domain/services/word_bulk_parser.dart';
import '../../domain/usecases/preview_word_search_usecase.dart';
import '../../domain/usecases/create_word_search_usecase.dart';
import 'editor_state.dart';

final editorRepositoryProvider = Provider<EditorRepository>((ref) {
  return EditorRepositoryImpl(EditorRemoteDataSource(ApiClient()));
});

final previewWordSearchUseCaseProvider = Provider<PreviewWordSearchUseCase>((ref) {
  return PreviewWordSearchUseCase(ref.watch(editorRepositoryProvider));
});

final createWordSearchUseCaseProvider = Provider<CreateWordSearchUseCase>((ref) {
  return CreateWordSearchUseCase(ref.watch(editorRepositoryProvider));
});

final editorNotifierProvider = StateNotifierProvider.autoDispose<EditorNotifier, EditorState>((ref) {
  return EditorNotifier(ref.watch(previewWordSearchUseCaseProvider), ref.watch(createWordSearchUseCaseProvider));
});

/// Estado del editor. Cualquier cambio que altere la cuadrícula (palabras,
/// dificultad, tamaño) descarta la vista previa para que nunca se publique
/// una sopa distinta a la que se está viendo.
class EditorNotifier extends StateNotifier<EditorState> {
  final PreviewWordSearchUseCase _previewUseCase;
  final CreateWordSearchUseCase _createUseCase;

  EditorNotifier(this._previewUseCase, this._createUseCase) : super(const EditorState());

  void setTitle(String title) => state = state.copyWith(title: title);
  void setDescription(String desc) => state = state.copyWith(description: desc);
  void setCategory(CategoryEntity category) => state = state.copyWith(category: category);
  void setDifficulty(String diff) => state = state.copyWith(difficulty: diff, clearPreview: true);
  void setGridSize(int size) => state = state.copyWith(gridSize: size, clearPreview: true);
  void setPublic(bool isPublic) => state = state.copyWith(isPublic: isPublic);

  /// Agrega lo que venga (una palabra o una lista pegada) y devuelve el
  /// resumen para que la interfaz cuente qué entró y qué no.
  WordBulkParseResult addFromText(String text) {
    final result = WordBulkParser.parse(text, existing: state.words);
    addWords(result.words);
    return result;
  }

  void addWords(List<String> words) {
    final fresh = words.where((w) => !state.words.contains(w)).toList();
    if (fresh.isEmpty) return;
    final merged = [...state.words, ...fresh].take(EditorState.maxWords).toList();
    state = state.copyWith(words: merged, gridSize: _gridThatFits(merged), clearPreview: true);
  }

  /// Corrige una palabra ya agregada. Devuelve un mensaje si no se pudo.
  String? replaceWord(String old, String raw) {
    final word = WordBulkParser.normalize(raw);
    if (word.length < WordBulkParser.minLength || word.length > WordBulkParser.maxLength) {
      return 'Usa de ${WordBulkParser.minLength} a ${WordBulkParser.maxLength} letras';
    }
    if (word != old && state.words.contains(word)) return '$word ya está en la lista';
    final words = state.words.map((w) => w == old ? word : w).toList();
    state = state.copyWith(words: words, gridSize: _gridThatFits(words), clearPreview: true);
    return null;
  }

  void removeWord(String word) {
    state = state.copyWith(words: state.words.where((w) => w != word).toList(), clearPreview: true);
  }

  void clearWords() => state = state.copyWith(words: const [], clearPreview: true);

  /// La cuadrícula crece sola si una palabra no cabe (nunca se achica).
  int _gridThatFits(List<String> words) {
    final longest = words.fold<int>(0, (m, w) => math.max(m, w.length));
    return math.min(20, math.max(state.gridSize, longest));
  }

  Future<bool> generatePreview() async {
    final problem = _validate();
    if (problem != null) {
      state = state.copyWith(errorMessage: problem);
      return false;
    }
    state = state.copyWith(isGeneratingPreview: true, errorMessage: null);
    final result = await _previewUseCase(words: state.words, gridSize: state.gridSize, difficulty: state.difficulty);
    if (!mounted) return false;
    return result.fold(
      (err) {
        state = state.copyWith(isGeneratingPreview: false, errorMessage: err);
        return false;
      },
      (preview) {
        state = state.copyWith(isGeneratingPreview: false, preview: preview);
        return true;
      },
    );
  }

  Future<bool> submit() async {
    final problem = _validate();
    if (problem != null) {
      state = state.copyWith(errorMessage: problem);
      return false;
    }
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    final result = await _createUseCase(
      title: state.title.trim(),
      description: state.description.isNotEmpty ? state.description : null,
      category: state.category!.key,
      difficulty: state.difficulty,
      gridSize: state.gridSize,
      words: state.words,
      isPublic: state.isPublic,
    );
    if (!mounted) return false;
    return result.fold(
      (err) {
        state = state.copyWith(isSubmitting: false, errorMessage: err);
        return false;
      },
      (created) {
        state = state.copyWith(isSubmitting: false, createdResult: created, successMessage: '¡Sopa creada!');
        return true;
      },
    );
  }

  String? _validate() {
    if (!state.hasTitle) return 'Ponle un nombre de al menos 3 letras';
    if (state.category == null) return 'Elige un tema para tu sopa';
    if (!state.hasEnoughWords) return 'Agrega al menos ${EditorState.minWords} palabras';
    return null;
  }

  void reset() => state = const EditorState();
}
