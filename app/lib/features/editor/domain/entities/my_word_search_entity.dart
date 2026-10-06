import 'package:equatable/equatable.dart';

class MyWordSearchEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String category;
  final String difficulty;
  final int gridSize;
  final int wordCount;
  final int playCount;
  final bool isPublic;
  final DateTime createdAt;

  const MyWordSearchEntity({
    required this.id,
    required this.title,
    this.description,
    required this.category,
    required this.difficulty,
    required this.gridSize,
    required this.wordCount,
    required this.playCount,
    required this.isPublic,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        category,
        difficulty,
        gridSize,
        wordCount,
        playCount,
        isPublic,
        createdAt,
      ];
}
