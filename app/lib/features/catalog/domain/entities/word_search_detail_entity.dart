import 'package:equatable/equatable.dart';

class WordSearchDetailEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String category;
  final String difficulty;
  final String language;
  final int gridSize;
  final int wordCount;
  final List<String> words;
  final int playCount;
  final String creatorId;
  final String creatorName;
  final List<List<String>> previewGrid;
  final DateTime createdAt;

  const WordSearchDetailEntity({
    required this.id,
    required this.title,
    this.description,
    required this.category,
    required this.difficulty,
    required this.language,
    required this.gridSize,
    required this.wordCount,
    required this.words,
    required this.playCount,
    required this.creatorId,
    required this.creatorName,
    required this.previewGrid,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        category,
        difficulty,
        language,
        gridSize,
        wordCount,
        words,
        playCount,
        creatorId,
        creatorName,
        previewGrid,
        createdAt,
      ];
}
