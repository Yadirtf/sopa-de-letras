import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/game_board_provider.dart';
import 'word_search_painter.dart';

class WordSearchCanvasWidget extends ConsumerWidget {
  final List<List<String>> grid;
  final Function(String word, CellCoord start, CellCoord end) onWordCompleted;

  const WordSearchCanvasWidget({
    super.key,
    required this.grid,
    required this.onWordCompleted,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (grid.isEmpty) return const SizedBox.shrink();

    final rows = grid.length;
    final cols = grid[0].length;
    final selectionState = ref.watch(gameBoardProvider);
    final notifier = ref.read(gameBoardProvider.notifier);

    return LayoutBuilder(
      builder: (context, constraints) {
        final size = constraints.maxWidth;
        final cellWidth = size / cols;
        final cellHeight = size / rows;

        void handlePan(Offset localPos, bool isStart) {
          final c = (localPos.dx / cellWidth).floor().clamp(0, cols - 1);
          final r = (localPos.dy / cellHeight).floor().clamp(0, rows - 1);
          if (isStart) {
            notifier.startSelection(r, c, grid);
          } else {
            notifier.updateSelection(r, c, grid);
          }
        }

        return GestureDetector(
          onPanStart: (d) => handlePan(d.localPosition, true),
          onPanUpdate: (d) => handlePan(d.localPosition, false),
          onPanEnd: (_) {
            final finished = notifier.clearSelection();
            if (finished.selectedCells.isNotEmpty &&
                finished.startCell != null &&
                finished.currentCell != null &&
                finished.formedWord.length >= 3) {
              onWordCompleted(
                finished.formedWord,
                finished.startCell!,
                finished.selectedCells.last,
              );
            }
          },
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: AppColors.bgCard.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderGlow),
            ),
            child: Stack(
              children: [
                CustomPaint(
                  size: Size(size, size),
                  painter: WordSearchPainter(
                    rows: rows,
                    cols: cols,
                    selectedCells: selectionState.selectedCells,
                  ),
                ),
                GridView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: cols,
                  ),
                  itemCount: rows * cols,
                  itemBuilder: (context, index) {
                    final r = index ~/ cols;
                    final c = index % cols;
                    final letter = grid[r][c];

                    return Center(
                      child: Text(
                        letter,
                        style: AppTypography.titleLarge.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: size < 360 ? 14 : 18,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
