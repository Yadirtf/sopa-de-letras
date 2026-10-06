import '../../domain/entities/placed_word_entity.dart';

class PlacedWordModel extends PlacedWordEntity {
  const PlacedWordModel({
    required super.word,
    required super.startRow,
    required super.startCol,
    required super.endRow,
    required super.endCol,
    required super.direction,
  });

  factory PlacedWordModel.fromJson(Map<String, dynamic> json) {
    return PlacedWordModel(
      word: json['word'] as String,
      startRow: json['startRow'] as int,
      startCol: json['startCol'] as int,
      endRow: json['endRow'] as int,
      endCol: json['endCol'] as int,
      direction: json['direction'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'startRow': startRow,
      'startCol': startCol,
      'endRow': endRow,
      'endCol': endCol,
      'direction': direction,
    };
  }
}
