import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/game_board_provider.dart';

class WordSearchPainter extends CustomPainter {
  final int rows;
  final int cols;
  final List<CellCoord> selectedCells;
  final Color selectionColor;

  WordSearchPainter({
    required this.rows,
    required this.cols,
    required this.selectedCells,
    this.selectionColor = AppColors.accentViolet,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (selectedCells.isEmpty || rows == 0 || cols == 0) return;

    final cellWidth = size.width / cols;
    final cellHeight = size.height / rows;

    final glowPaint = Paint()
      ..color = selectionColor.withValues(alpha: 0.35)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    final fillPaint = Paint()
      ..color = selectionColor.withValues(alpha: 0.5)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = selectionColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    for (final cell in selectedCells) {
      final rect = Rect.fromLTWH(
        cell.col * cellWidth + 2,
        cell.row * cellHeight + 2,
        cellWidth - 4,
        cellHeight - 4,
      );
      final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(8));

      canvas.drawRRect(rrect, glowPaint);
      canvas.drawRRect(rrect, fillPaint);
      canvas.drawRRect(rrect, borderPaint);
    }
  }

  @override
  bool shouldRepaint(covariant WordSearchPainter oldDelegate) {
    return oldDelegate.selectedCells != selectedCells ||
        oldDelegate.selectionColor != selectionColor;
  }
}
