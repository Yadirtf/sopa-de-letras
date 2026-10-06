import 'package:equatable/equatable.dart';
import 'placed_word_entity.dart';

class PreviewWordSearchEntity extends Equatable {
  final List<List<String>> grid;
  final List<PlacedWordEntity> placedWords;
  final int gridSize;

  const PreviewWordSearchEntity({
    required this.grid,
    required this.placedWords,
    required this.gridSize,
  });

  @override
  List<Object?> get props => [grid, placedWords, gridSize];
}
