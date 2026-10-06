import 'package:equatable/equatable.dart';

class PlacedWordEntity extends Equatable {
  final String word;
  final int startRow;
  final int startCol;
  final int endRow;
  final int endCol;
  final String direction;

  const PlacedWordEntity({
    required this.word,
    required this.startRow,
    required this.startCol,
    required this.endRow,
    required this.endCol,
    required this.direction,
  });

  @override
  List<Object?> get props => [
        word,
        startRow,
        startCol,
        endRow,
        endCol,
        direction,
      ];
}
