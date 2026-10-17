import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../domain/entities/battle_view.dart';
import 'battle_grid_layers.dart';
import 'battle_shot_painter.dart';

/// Pinta la arena como la hoja cuadriculada: letras arriba, números a la
/// izquierda, figuras con su dibujo, puntos para el agua y sombreado para los tocados.
class BattleGridPainter extends CustomPainter {
  final BattleGridLayers layers;
  final double cell;
  final double label;
  final double flash;

  BattleGridPainter({required this.layers, required this.cell, required this.label, this.flash = 0});

  Rect cellRect(int c, int r, [int w = 1, int h = 1]) =>
      Rect.fromLTWH(label + c * cell, label + r * cell, w * cell, h * cell);

  @override
  void paint(Canvas canvas, Size size) {
    _ground(canvas);
    _labels(canvas);
    for (final unit in layers.units) {
      _unit(canvas, unit);
    }
    _marks(canvas);
    for (final scan in layers.scans) {
      BattleShotPainter.radarBadge(canvas, cellRect(scan.col - 1, scan.row - 1, 3, 3), scan.count, faded: true);
    }
    final shot = layers.lastShot;
    if (shot != null) BattleShotPainter(this, layers.ink).paint(canvas, shot, flash);
    final aim = layers.aim;
    if (aim != null) _aim(canvas, aim.$1, aim.$2);
  }

  void _ground(Canvas canvas) {
    final board = cellRect(0, 0, layers.cols, layers.rows);
    canvas.drawRRect(RRect.fromRectAndRadius(board, const Radius.circular(6)), Paint()..color = layers.terrain.ground);
    final line = Paint()
      ..color = layers.terrain.gridLine.withValues(alpha: 0.7)
      ..strokeWidth = 0.6;
    for (var c = 1; c < layers.cols; c++) {
      canvas.drawLine(Offset(board.left + c * cell, board.top), Offset(board.left + c * cell, board.bottom), line);
    }
    for (var r = 1; r < layers.rows; r++) {
      canvas.drawLine(Offset(board.left, board.top + r * cell), Offset(board.right, board.top + r * cell), line);
    }
  }

  void _labels(Canvas canvas) {
    final style =
        TextStyle(color: AppColors.textSecondary, fontSize: math.min(cell * 0.55, 13), fontWeight: FontWeight.w600);
    for (var c = 0; c < layers.cols; c++) {
      _text(canvas, String.fromCharCode(65 + c), Offset(label + (c + 0.5) * cell, label / 2), style);
    }
    for (var r = 0; r < layers.rows; r++) {
      _text(canvas, '${r + 1}', Offset(label / 2, label + (r + 0.5) * cell), style);
    }
  }

  void _unit(Canvas canvas, GridUnit u) {
    final rect = cellRect(u.col, u.row, u.width, u.height).deflate(cell * 0.08);
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(cell * 0.25));
    final base = u.conflict
        ? AppColors.accentRose
        : u.enemy
            ? AppColors.accentRose.withValues(alpha: 0.75)
            : AppColors.accentViolet;
    canvas.drawRRect(rrect, Paint()..color = base.withValues(alpha: u.destroyed ? 0.35 : 0.55));
    canvas.drawRRect(
      rrect,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = u.selected ? 3 : 1.4
        ..color = u.selected ? AppColors.accentAmber : base,
    );
    final emojiSize = math.min(rect.width, rect.height) * 0.72;
    _text(canvas, u.emoji, rect.center, TextStyle(fontSize: emojiSize), opacity: u.destroyed ? 0.55 : 1);
  }

  void _marks(Canvas canvas) {
    layers.marks.forEach((key, mark) {
      final parts = key.split(',');
      final rect = cellRect(int.parse(parts[0]), int.parse(parts[1]));
      if (mark == CellMark.miss) {
        canvas.drawCircle(rect.center, math.max(cell * 0.12, 1.6), Paint()..color = layers.ink.withValues(alpha: 0.85));
      } else {
        _hatch(canvas, rect.deflate(cell * 0.06));
      }
    });
  }

  /// Sombreado a rayas, como se tachaban los aciertos en el papel.
  void _hatch(Canvas canvas, Rect rect) {
    canvas.drawRect(rect, Paint()..color = const Color(0xFF7A1020).withValues(alpha: 0.55));
    final stroke = Paint()
      ..color = const Color(0xFF1B0508)
      ..strokeWidth = math.max(cell * 0.08, 1);
    canvas.save();
    canvas.clipRect(rect);
    for (var d = -rect.height; d < rect.width; d += cell * 0.22) {
      canvas.drawLine(Offset(rect.left + d, rect.bottom), Offset(rect.left + d + rect.height, rect.top), stroke);
    }
    canvas.restore();
  }

  void _aim(Canvas canvas, int c, int r) {
    final rect = cellRect(c, r).inflate(1);
    canvas.drawRect(
      rect,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..color = AppColors.accentAmber,
    );
  }

  void _text(Canvas canvas, String text, Offset center, TextStyle style, {double opacity = 1}) {
    final painter = TextPainter(text: TextSpan(text: text, style: style), textDirection: TextDirection.ltr)..layout();
    if (opacity < 1) canvas.saveLayer(null, Paint()..color = Color.fromRGBO(0, 0, 0, opacity));
    painter.paint(canvas, center - Offset(painter.width / 2, painter.height / 2));
    if (opacity < 1) canvas.restore();
  }

  @override
  bool shouldRepaint(covariant BattleGridPainter old) => old.layers != layers || old.cell != cell || old.flash != flash;
}
