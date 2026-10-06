import '../../domain/entities/word_search_detail_entity.dart';

class WordSearchDetailModel extends WordSearchDetailEntity {
  const WordSearchDetailModel({
    required super.id,
    required super.title,
    super.description,
    required super.category,
    required super.difficulty,
    required super.language,
    required super.gridSize,
    required super.wordCount,
    required super.words,
    required super.playCount,
    required super.creatorId,
    required super.creatorName,
    required super.previewGrid,
    required super.createdAt,
  });

  factory WordSearchDetailModel.fromJson(Map<String, dynamic> json) {
    final wordsRaw = json['words'] as List<dynamic>? ?? [];
    final words = wordsRaw.map((e) => e.toString()).toList();

    final previewGridRaw = json['previewGrid'] as List<dynamic>? ?? [];
    final previewGrid = previewGridRaw
        .map((row) => (row as List<dynamic>).map((c) => c.toString()).toList())
        .toList();

    return WordSearchDetailModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
      language: json['language'] as String? ?? 'es',
      gridSize: json['gridSize'] as int,
      wordCount: json['wordCount'] as int,
      words: words,
      playCount: json['playCount'] as int? ?? 0,
      creatorId: json['creatorId'] as String,
      creatorName: json['creatorName'] as String? ?? 'WordHive Community',
      previewGrid: previewGrid,
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
      'words': words,
      'playCount': playCount,
      'creatorId': creatorId,
      'creatorName': creatorName,
      'previewGrid': previewGrid,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
