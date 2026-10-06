import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../providers/game_board_provider.dart';

/// Una palabra ya encontrada: se pinta como una "capsula" del color de quien la hallo.
class FoundStroke {
  final CellCoord start;
  final CellCoord end;
  final Color color;
  const FoundStroke(this.start, this.end, this.color);
}

/// Dibuja el tablero completo en una sola pasada: cuadricula, capsulas de palabras
/// encontradas, el trazo que el dedo esta haciendo y las letras encima.
class WordSearchPainter extends CustomPainter {
  final List<List<String>> grid;
  final double cellSize;
  final List<FoundStroke> found;
  final List<CellCoord> selectedCells;
  final Color selectionColor;

  WordSearchPainter({
    required this.grid,
    required this.cellSize,
    required this.found,
    required this.selectedCells,
    this.selectionColor = AppColors.accentViolet,
  });

  Offset _center(CellCoord c) => Offset((c.col + 0.5) * cellSize, (c.row + 0.5) * cellSize);

  void _capsule(Canvas canvas, CellCoord a, CellCoord b, Color color, {required bool active}) {
    final width = cellSize * 0.78;
    final p1 = _center(a);
    final p2 = _center(b);
    canvas.drawLine(
      p1,
      p2,
      Paint()
        ..color = color.withValues(alpha: active ? 0.55 : 0.32)
        ..strokeWidth = width
        ..strokeCap = StrokeCap.round,
    );
    canvas.drawLine(
      p1,
      p2,
      Paint()
        ..color = color.withValues(alpha: active ? 1 : 0.7)
        ..style = PaintingStyle.stroke
        ..strokeWidth = active ? 3 : 1.5
        ..strokeCap = StrokeCap.round,
    );
  }

  /// Cuadricula visible: cada letra en su casilla ayuda a seguir filas, columnas
  /// y diagonales, sobre todo a quien tiene baja vision.
  void _grid(Canvas canvas, Size size) {
    final rows = grid.length;
    final cols = grid.first.length;
    final line = Paint()
      ..color = AppColors.textSecondary.withValues(alpha: 0.28)
      ..strokeWidth = 1;
    for (var r = 1; r < rows; r++) {
      canvas.drawLine(Offset(0, r * cellSize), Offset(cols * cellSize, r * cellSize), line);
    }
    for (var c = 1; c < cols; c++) {
      canvas.drawLine(Offset(c * cellSize, 0), Offset(c * cellSize, rows * cellSize), line);
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (grid.isEmpty || grid.first.isEmpty) return;
    _grid(canvas, size);
    for (final s in found) {
      _capsule(canvas, s.start, s.end, s.color, active: false);
    }
    if (selectedCells.isNotEmpty) {
      _capsule(canvas, selectedCells.first, selectedCells.last, selectionColor, active: true);
    }

    final selected = selectedCells.toSet();
    final fontSize = (cellSize * 0.52).clamp(10.0, 30.0);
    for (var r = 0; r < grid.length; r++) {
      for (var c = 0; c < grid[r].length; c++) {
        final isSelected = selected.contains(CellCoord(r, c));
        final text = TextPainter(
          text: TextSpan(
            text: grid[r][c].toUpperCase(),
            style: AppTypography.pinKey.copyWith(
              fontSize: isSelected ? fontSize * 1.12 : fontSize,
              fontWeight: FontWeight.w700,
              color: isSelected ? Colors.white : AppColors.textPrimary,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        final center = _center(CellCoord(r, c));
        text.paint(canvas, center - Offset(text.width / 2, text.height / 2));
      }
    }
  }

  @override
  bool shouldRepaint(covariant WordSearchPainter old) =>
      old.selectedCells != selectedCells || old.found != found || old.cellSize != cellSize || old.grid != grid;
}
