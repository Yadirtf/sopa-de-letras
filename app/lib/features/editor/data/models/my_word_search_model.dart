import '../../domain/entities/my_word_search_entity.dart';

class MyWordSearchModel extends MyWordSearchEntity {
  const MyWordSearchModel({
    required super.id,
    required super.title,
    super.description,
    required super.category,
    required super.difficulty,
    required super.gridSize,
    required super.wordCount,
    required super.playCount,
    required super.isPublic,
    required super.createdAt,
  });

  factory MyWordSearchModel.fromJson(Map<String, dynamic> json) {
    return MyWordSearchModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
      gridSize: json['gridSize'] as int,
      wordCount: json['wordCount'] as int,
      playCount: json['playCount'] as int? ?? 0,
      isPublic: json['isPublic'] as bool? ?? true,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }
}
