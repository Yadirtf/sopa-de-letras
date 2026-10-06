import 'package:equatable/equatable.dart';
import '../../domain/entities/preview_word_search_entity.dart';
import '../../domain/entities/my_word_search_entity.dart';

class EditorState extends Equatable {
  final String title;
  final String description;
  final String category;
  final String difficulty;
  final int gridSize;
  final List<String> words;
  final bool isPublic;
  final bool isGeneratingPreview;
  final bool isSubmitting;
  final PreviewWordSearchEntity? preview;
  final MyWordSearchEntity? createdResult;
  final String? errorMessage;
  final String? successMessage;

  const EditorState({
    this.title = '',
    this.description = '',
    this.category = 'NATURALEZA',
    this.difficulty = 'MEDIUM',
    this.gridSize = 12,
    this.words = const [],
    this.isPublic = true,
    this.isGeneratingPreview = false,
    this.isSubmitting = false,
    this.preview,
    this.createdResult,
    this.errorMessage,
    this.successMessage,
  });

  EditorState copyWith({
    String? title,
    String? description,
    String? category,
    String? difficulty,
    int? gridSize,
    List<String>? words,
    bool? isPublic,
    bool? isGeneratingPreview,
    bool? isSubmitting,
    PreviewWordSearchEntity? preview,
    MyWordSearchEntity? createdResult,
    String? errorMessage,
    String? successMessage,
  }) {
    return EditorState(
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      gridSize: gridSize ?? this.gridSize,
      words: words ?? this.words,
      isPublic: isPublic ?? this.isPublic,
      isGeneratingPreview: isGeneratingPreview ?? this.isGeneratingPreview,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      preview: preview ?? this.preview,
      createdResult: createdResult ?? this.createdResult,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }

  @override
  List<Object?> get props => [
        title,
        description,
        category,
        difficulty,
        gridSize,
        words,
        isPublic,
        isGeneratingPreview,
        isSubmitting,
        preview,
        createdResult,
        errorMessage,
        successMessage,
      ];
}
