import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../data/datasources/editor_remote_datasource.dart';
import '../../data/repositories/editor_repository_impl.dart';
import '../../domain/repositories/editor_repository.dart';
import '../../domain/usecases/preview_word_search_usecase.dart';
import '../../domain/usecases/create_word_search_usecase.dart';
import 'editor_state.dart';

final editorRepositoryProvider = Provider<EditorRepository>((ref) {
  final apiClient = ApiClient();
  final remoteDs = EditorRemoteDataSource(apiClient);
  return EditorRepositoryImpl(remoteDs);
});

final previewWordSearchUseCaseProvider = Provider<PreviewWordSearchUseCase>((ref) {
  return PreviewWordSearchUseCase(ref.watch(editorRepositoryProvider));
});

final createWordSearchUseCaseProvider = Provider<CreateWordSearchUseCase>((ref) {
  return CreateWordSearchUseCase(ref.watch(editorRepositoryProvider));
});

final editorNotifierProvider = StateNotifierProvider<EditorNotifier, EditorState>((ref) {
  final previewUseCase = ref.watch(previewWordSearchUseCaseProvider);
  final createUseCase = ref.watch(createWordSearchUseCaseProvider);
  return EditorNotifier(previewUseCase, createUseCase);
});

class EditorNotifier extends StateNotifier<EditorState> {
  final PreviewWordSearchUseCase _previewUseCase;
  final CreateWordSearchUseCase _createUseCase;

  EditorNotifier(this._previewUseCase, this._createUseCase) : super(const EditorState());

  void setTitle(String title) => state = state.copyWith(title: title);
  void setDescription(String desc) => state = state.copyWith(description: desc);
  void setCategory(String category) => state = state.copyWith(category: category);
  void setDifficulty(String diff) => state = state.copyWith(difficulty: diff);
  void setGridSize(int size) => state = state.copyWith(gridSize: size);
  void setPublic(bool isPublic) => state = state.copyWith(isPublic: isPublic);

  void addWord(String word) {
    final cleaned = word.trim().toUpperCase();
    if (cleaned.length < 3 || cleaned.length > 15) return;
    if (state.words.contains(cleaned) || state.words.length >= 20) return;
    state = state.copyWith(words: [...state.words, cleaned], preview: null);
  }

  void removeWord(String word) {
    state = state.copyWith(
      words: state.words.where((w) => w != word).toList(),
      preview: null,
    );
  }

  Future<bool> generatePreview() async {
    if (state.words.length < 5) {
      state = state.copyWith(errorMessage: 'Debes ingresar al menos 5 palabras');
      return false;
    }
    state = state.copyWith(isGeneratingPreview: true, errorMessage: null);

    final result = await _previewUseCase(
      words: state.words,
      gridSize: state.gridSize,
      difficulty: state.difficulty,
    );

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
    if (state.title.trim().length < 3) {
      state = state.copyWith(errorMessage: 'El título debe tener al menos 3 caracteres');
      return false;
    }
    if (state.words.length < 5) {
      state = state.copyWith(errorMessage: 'Debes ingresar al menos 5 palabras');
      return false;
    }

    state = state.copyWith(isSubmitting: true, errorMessage: null);
    final result = await _createUseCase(
      title: state.title,
      description: state.description.isNotEmpty ? state.description : null,
      category: state.category,
      difficulty: state.difficulty,
      gridSize: state.gridSize,
      words: state.words,
      isPublic: state.isPublic,
    );

    return result.fold(
      (err) {
        state = state.copyWith(isSubmitting: false, errorMessage: err);
        return false;
      },
      (created) {
        state = state.copyWith(
          isSubmitting: false,
          createdResult: created,
          successMessage: '¡Sopa creada exitosamente!',
        );
        return true;
      },
    );
  }

  void reset() => state = const EditorState();
}
