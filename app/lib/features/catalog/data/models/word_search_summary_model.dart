import '../../domain/entities/word_search_summary_entity.dart';

class WordSearchSummaryModel extends WordSearchSummaryEntity {
  const WordSearchSummaryModel({
    required super.id,
    required super.title,
    super.description,
    required super.category,
    required super.difficulty,
    required super.language,
    required super.gridSize,
    required super.wordCount,
    required super.playCount,
    required super.creatorId,
    required super.creatorName,
    required super.createdAt,
  });

  factory WordSearchSummaryModel.fromJson(Map<String, dynamic> json) {
    return WordSearchSummaryModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
      language: json['language'] as String? ?? 'es',
      gridSize: json['gridSize'] as int,
      wordCount: json['wordCount'] as int,
      playCount: json['playCount'] as int? ?? 0,
      creatorId: json['creatorId'] as String,
      creatorName: json['creatorName'] as String? ?? 'WordHive Community',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'difficulty': difficulty,
      'language': language,
      'gridSize': gridSize,
      'wordCount': wordCount,
      'playCount': playCount,
      'creatorId': creatorId,
      'creatorName': creatorName,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
